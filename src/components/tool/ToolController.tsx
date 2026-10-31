'use client';

/**
 * ToolController — client state machine for the 7 tool pages.
 * States: empty (static HTML) → dragover → processing → result / error / cap.
 * Markup: state-templates.ts (frozen copy). Engines: tracer / svg-flatten /
 * dxf / jfif — all local, zero file exfiltration (03 P1-2).
 *
 * Integration points left for 08 (documented in handoff):
 *   POST /api/feedback        — feedback + share opt-in
 *   POST /api/license/verify  — Pro activation (04 §4.3)
 *   POST /api/checkout        — Creem checkout (pricing CTAs)
 */
import { useEffect, useRef } from 'react';
import { CAP_COPY, DL_COPY, STATE_COPY, STEPS } from '@/lib/copy';
import { buildDxf, geoDims, prepareLayers, PX_TO_MM, type TraceLayer } from '@/lib/dxf';
import { layersToSvg } from '@/lib/svg-flatten';
import { flattenSvgAsync } from '@/lib/flatten-client';
import { guardRasterInput, MAX_INPUT_EDGE } from '@/lib/downscale';
import { precisionConfig, preprocessImage, traceImage } from '@/lib/tracer';
import { captureLicenseFromUrl, consumeHdTry, getQuota, hdTriesLeft, isProActive, recordConversion } from '@/lib/quota';
import { beacon } from '@/lib/beacon';
import { wireLicenseEntry } from '@/lib/license-panel';
import { capHtml, errorHtml, feedbackOkHtml, JFIF_LAYER_NOTE, JFIF_PNG_LAYER_NOTE, JFIF_PNG_LAYER_NOTE_PT, proActiveHtml, resultHtml, processingHtml, type ResultRender } from './state-templates';
import { createProgressUI, SVG_PHASES, TRACE_PHASES, type ProgressUI } from './progress';
import { openFeedbackDialog, TOOL_BUSY_EVENT } from '../feedback';

export type ToolKind = 'trace-multi' | 'trace-raster' | 'screenshot' | 'svg-dxf' | 'jfif' | 'jfif-png' | 'webp-svg';

export interface ToolProps {
  kind: ToolKind;
  lang: 'en' | 'pt';
  accept: string[]; // ['.png']
  errorMessage: string; // frozen full error sentence (may contain <b>)
  anchorId?: string; // default 'convert'
  outputBase?: string;
  /** 05 v1.12 #82: render the Cut-settings param panel in the result state
   *  (/png-to-dxf/ only, EN-only batch — zhongshu: jpg-to-dxf follow-up is a
   *  separate fast-follow batch, NOT this one). */
  paramPanel?: boolean;
}

interface RunOutput {
  inputUrl: string;
  outputUrl: string;
  svgText: string | null; // vector output (trace/svg kinds)
  width: number;
  height: number;
  layers: TraceLayer[];
  blobs: Record<string, { blob: Blob; filename: string }>;
  layersNoteHtml?: string;
  /** #82: prepared layers kept in memory so a mm-width change can rebuild the
   *  DXF blobs without re-running the pipeline (<50ms string assembly). */
  prepared?: ReturnType<typeof prepareLayers>;
  /** #82: geometry bbox span (px) — mm-width scale basis (see dxf.geoDims). */
  geoW?: number;
  geoH?: number;
}

function setBusy(b: boolean) {
  window.dispatchEvent(new CustomEvent(TOOL_BUSY_EVENT, { detail: b }));
}

function extOf(name: string): string {
  const i = name.lastIndexOf('.');
  return i === -1 ? '' : name.slice(i).toLowerCase();
}

function baseOf(name: string): string {
  const b = name.replace(/\.[^.]+$/, '').replace(/[^\w-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return b || 'image';
}

/**
 * #18 big-file guard UI note — NEW COPY, not part of the 05 v1.2 freeze.
 * [NEEDS-COPY-REVIEW] — route through zhongshu/05c before freeze.
 */
const SIZE_NOTE = {
  en: `Large image — auto-resized to ${MAX_INPUT_EDGE}px on the long edge so conversion stays fast. Still 100% on your device, nothing uploaded.`,
  pt: `Imagem grande — redimensionada automaticamente para ${MAX_INPUT_EDGE}px no lado maior para manter a conversão rápida. Ainda 100% no seu navegador, nada foi enviado.`,
} as const;

function sizeNoteHtml(note: string): string {
  return `<div class="state-note state-note--info" data-tool-size-note style="margin-top:12px"><span>${note}</span></div>`;
}

export default function ToolController(props: ToolProps) {
  const { kind, lang, accept, errorMessage } = props;
  const anchorId = props.anchorId ?? 'convert';
  const rootRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<{
    initialHtml: string | null;
    cleanupOn: boolean;
    presetOn: boolean;
    segVersion: 'R2000' | 'R12';
    lastFile: { bytes: Uint8Array; name: string; mime: string } | null;
    out: RunOutput | null;
    urls: string[];
    precision: number;
    aiHdOn: boolean;
    sizeNote: string | null; // #18: resize notice shown in processing + result
    // ---- 05 v1.12 #82 param-panel state (only consulted when props.paramPanel) ----
    widthMm: number | null; // null = default 96dpi conversion (PX_TO_MM)
    colorThreshold: number; // colorPrecision 4–9, initial = precisionConfig(6)
    smooth: number; // 1–10, 5 = legacy 0.8 flatten step
    mode: 'cut' | 'engrave'; // cut = Cutout(1, 01.5 default), engrave = Stacked(0)
  }>({
    initialHtml: null,
    cleanupOn: true, // "Clean up bad images (recommended)" — design default ON
    presetOn: true, // "Optimized for screenshots" — design default ON
    segVersion: 'R2000',
    lastFile: null,
    out: null,
    urls: [],
    precision: 6,
    aiHdOn: false,
    sizeNote: null,
    widthMm: null,
    colorThreshold: precisionConfig(6).colorPrecision ?? 7,
    smooth: 5,
    mode: 'cut',
  });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    // The dropzone lives in the PageShell's frozen mainHtml (a SIBLING of this
    // component, not a child) — query the document, not our own subtree.
    const dzEl = document.querySelector<HTMLElement>(`#${anchorId}`);
    if (!dzEl) return;
    const dz: HTMLElement = dzEl;
    const S = stateRef.current;
    S.initialHtml = dz.innerHTML;

    // 05 v1.6 cancel/watchdog state (2026-10-14): runSeq invalidates in-flight
    // runs on cancel/reset so their late resolve/reject is discarded; watchdog
    // auto-fails a run that exceeds the hard cap (honest frozen error state
    // instead of an endless spinner — user report: "stuck, no close button,
    // had to refresh").
    let runSeq = 0;
    let watchdog: ReturnType<typeof setTimeout> | null = null;
    let activeProg: ProgressUI | null = null;
    const WATCHDOG_MS = 240_000; // > worst honest big-file run (~141s @22MB, 09 QA)

    void captureLicenseFromUrl().then(() => {
      if (isProActive()) dz.insertAdjacentHTML('afterbegin', proActiveHtml(lang));
    });

    // ---- file input (hidden) ----
    const picker = document.createElement('input');
    picker.type = 'file';
    picker.accept = accept.join(',');
    picker.style.display = 'none';
    root.appendChild(picker);

    const wireStatic = () => {
      // primary CTA → picker
      dz.querySelectorAll<HTMLButtonElement>('.btn--primary').forEach((b) => {
        if (b.dataset.toolDl) return;
        b.onclick = (e) => {
          e.stopPropagation();
          picker.click();
        };
      });
      // dropzone body click → picker (empty state affordance)
      dz.onclick = (e) => {
        if ((e.target as HTMLElement).closest('button, a, input, textarea, label, .result, .share-block, .feedback')) return;
        if (dz.dataset.state === 'result' || dz.dataset.state === 'processing') return;
        picker.click();
      };
      // seg control (DXF version)
      dz.querySelectorAll<HTMLElement>('.seg button').forEach((btn, i, all) => {
        btn.onclick = () => {
          all.forEach((b) => b.setAttribute('aria-pressed', 'false'));
          btn.setAttribute('aria-pressed', 'true');
          S.segVersion = i === 0 ? 'R2000' : 'R12';
        };
      });
      // switches present in static HTML (cleanup / screenshot preset)
      dz.querySelectorAll<HTMLElement>('label.switch').forEach((sw) => {
        if (sw.hasAttribute('data-tool-aihd')) return;
        sw.onclick = (e) => {
          e.preventDefault();
          sw.classList.toggle('off');
          const off = sw.classList.contains('off');
          if (sw.textContent?.includes('screenshots')) S.presetOn = !off;
          else S.cleanupOn = !off;
        };
      });
    };
    wireStatic();

    // ---- drag & drop ----
    const onDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (dz.dataset.state === 'processing') return;
      dz.classList.add('is-dragover');
      setBusy(true);
    };
    const onDragLeave = () => {
      dz.classList.remove('is-dragover');
      if (dz.dataset.state !== 'processing' && dz.dataset.state !== 'result') setBusy(false);
    };
    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      dz.classList.remove('is-dragover');
      const f = e.dataTransfer?.files?.[0];
      if (f) void run(f);
    };
    dz.addEventListener('dragover', onDragOver);
    dz.addEventListener('dragleave', onDragLeave);
    dz.addEventListener('drop', onDrop);
    picker.onchange = () => {
      const f = picker.files?.[0];
      if (f) void run(f);
      picker.value = '';
    };

    async function run(file: File) {
      const myRun = ++runSeq; // 05 v1.6: cancel token — stale runs discard their outcome
      // 1) format gate (frozen error)
      const ext = extOf(file.name);
      if (!accept.includes(ext)) {
        renderState('error', errorHtml(`<b>${errorMessage.split('</b>')[0]}</b> ${errorMessage.split('</b>')[1] ?? ''}`, lang));
        return;
      }
      // 2) quota gate (03: localStorage counter; IP-hash second factor = 08)
      const q = getQuota();
      if (!q.allowed) {
        beacon('cap_hit'); // #54 preregistered: cap state rendered
        renderState('cap', capHtml(lang));
        // 05 v1.5 §F-5 / zhongshu §D-3: license entry inside the cap state.
        wireLicenseEntry(dz, lang, () => {
          // Success → frozen badge row at the dropzone top (§C reuse pattern,
          // same as the ?license= auto-capture path at mount).
          if (!dz.querySelector('.badges')) dz.insertAdjacentHTML('afterbegin', proActiveHtml(lang));
        });
        setBusy(false);
        return;
      }

      beacon('tool_start'); // #54 preregistered: conversion started (post quota gate)
      renderState('processing', processingHtml(stepsFor(kind, lang), lang));
      // 07d: real staged progress — jfif/jfif-png repack+convert is near-instant, keep the
      // frozen static steps there; every other kind gets the live UI.
      const isSvgInput = kind === 'svg-dxf' || (kind === 'trace-multi' && ext === '.svg');
      const prog: ProgressUI | null =
        kind === 'jfif' || kind === 'jfif-png' ? null : createProgressUI(dz, isSvgInput ? SVG_PHASES : TRACE_PHASES, lang);
      activeProg = prog;
      // 05 v1.6 watchdog: never leave the user on an endless processing state.
      if (watchdog) clearTimeout(watchdog);
      watchdog = setTimeout(() => {
        if (myRun !== runSeq || dz.dataset.state !== 'processing') return;
        console.error('[cleanpaths] watchdog: conversion exceeded', WATCHDOG_MS, 'ms — failing honestly');
        runSeq++; // invalidate the stuck run — its late resolve/reject is discarded
        activeProg?.stop();
        activeProg = null;
        const c = STATE_COPY[lang];
        renderState('error', errorHtml(`<b>${c.err_fail_pre}</b> ${c.err_fail_hint} ${c.err_main_post}`, lang));
      }, WATCHDOG_MS);
      prog?.enter('read');
      let bytes = new Uint8Array(await file.arrayBuffer());
      S.lastFile = { bytes, name: file.name, mime: file.type || guessMime(ext) };

      // 3) #18 big-file guard: >10MB or longest edge >2000px → auto downscale
      //    before the engine (raster inputs only; svg/jfif pass through)
      S.sizeNote = null;
      if (kind !== 'jfif' && kind !== 'jfif-png' && ext !== '.svg') {
        try {
          const guarded = await guardRasterInput(bytes, S.lastFile.mime);
          if (guarded.downscaled) {
            bytes = guarded.bytes;
            S.lastFile = { bytes, name: file.name, mime: guarded.mime };
            S.sizeNote = SIZE_NOTE[lang];
            dz.insertAdjacentHTML('beforeend', sizeNoteHtml(S.sizeNote));
            prog?.bigFile(); // 07d: honest 1–2 min expectation for big files
          }
        } catch {
          /* decode failed — engine will surface the frozen error state */
        }
      }

      try {
        const out = await produce(bytes, file.name, S.lastFile.mime, prog);
        if (myRun !== runSeq) return; // 05 v1.6: cancelled/reset mid-run — discard
        if (watchdog) { clearTimeout(watchdog); watchdog = null; }
        prog?.finish();
        S.out = out;
        recordConversion();
        beacon('tool_complete'); // #54 preregistered: conversion completed
        renderResult();
      } catch (err) {
        if (myRun !== runSeq) return; // 05 v1.6: cancelled/reset mid-run — discard
        if (watchdog) { clearTimeout(watchdog); watchdog = null; }
        prog?.stop();
        console.error('[cleanpaths] conversion failed', err);
        // 05 v1.4 §F-2: processing-failure branch — err_fail group (never the
        // format-gate err_main_pre). err_main_post + err_btn reused per §C.
        const c = STATE_COPY[lang];
        renderState('error', errorHtml(`<b>${c.err_fail_pre}</b> ${c.err_fail_hint} ${c.err_main_post}`, lang));
      }
    }

    function stepsFor(k: ToolKind, l: 'en' | 'pt'): readonly string[] {
      if (k === 'jfif') return l === 'pt' ? STEPS.jfif_pt : STEPS.jfif;
      if (k === 'jfif-png') return l === 'pt' ? STEPS.jfif_png_pt : STEPS.jfif_png;
      if (k === 'webp-svg' && l === 'pt') return STEPS.webp_pt; // v1.9 F4: first PT trace steps
      if (k === 'svg-dxf') return STEPS.svg;
      return STEPS.trace;
    }

    async function produce(bytes: Uint8Array, name: string, mime: string, prog: ProgressUI | null = null): Promise<RunOutput> {
      const base = baseOf(name);
      const urls: string[] = [];
      const track = (b: Blob) => {
        const u = URL.createObjectURL(b);
        urls.push(u);
        return u;
      };
      S.urls.forEach((u) => URL.revokeObjectURL(u));
      S.urls = urls;

      if (kind === 'jfif') {
        if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) throw new Error('not a JFIF/JPEG container');
        const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'image/jpeg' });
        const url = track(blob);
        return {
          inputUrl: url,
          outputUrl: url,
          svgText: null,
          width: 0,
          height: 0,
          layers: [],
          layersNoteHtml: JFIF_LAYER_NOTE,
          blobs: { jpg: { blob, filename: `${base}.jpg` } },
        };
      }

      if (kind === 'jfif-png') {
        // 05 v1.8 A-group pipeline: decode JPEG pixels -> PNG encode (lossless container).
        // NO new lossy compression — this is what the F8 result note asserts (P1-gated).
        if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) throw new Error('not a JFIF/JPEG container');
        const srcBlob = new Blob([bytes.buffer as ArrayBuffer], { type: 'image/jpeg' });
        const bmp = await createImageBitmap(srcBlob);
        let pngBlob: Blob;
        if (typeof OffscreenCanvas !== 'undefined') {
          const c = new OffscreenCanvas(bmp.width, bmp.height);
          c.getContext('2d')!.drawImage(bmp, 0, 0);
          pngBlob = await c.convertToBlob({ type: 'image/png' });
        } else {
          const c = document.createElement('canvas');
          c.width = bmp.width;
          c.height = bmp.height;
          c.getContext('2d')!.drawImage(bmp, 0, 0);
          pngBlob = await new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('png encode failed'))), 'image/png'));
        }
        bmp.close();
        const inUrl = track(srcBlob);
        const outUrl = track(pngBlob);
        return {
          inputUrl: inUrl,
          outputUrl: outUrl,
          svgText: null,
          width: 0,
          height: 0,
          layers: [],
          layersNoteHtml: lang === 'pt' ? JFIF_PNG_LAYER_NOTE_PT : JFIF_PNG_LAYER_NOTE,
          blobs: { png: { blob: pngBlob, filename: `${base}.png` } },
        };
      }

      if (kind === 'svg-dxf' || (kind === 'trace-multi' && extOf(name) === '.svg')) {
        const text = new TextDecoder().decode(bytes);
        const step = stepForPrecision(S.precision);
        prog?.enter('paths'); // 07d: curves → polylines (real 0..1 from flatten worker)
        const layers = await flattenSvgAsync(text, { step, dropBackground: true, onProgress: (f) => prog?.phaseProgress(f) });
        if (layers.length === 0) throw new Error('no vector shapes found');
        prog?.enter('export');
        const prepared = prepareLayers(layers);
        const dims = svgDims(text);
        const r2000 = new Blob([buildDxf(prepared, 'R2000')], { type: 'application/dxf' });
        const r12 = new Blob([buildDxf(prepared, 'R12')], { type: 'application/dxf' });
        // Download SVG: optimizer pass via engine worker (main thread stays responsive)
        let svgBlob = new Blob([text], { type: 'image/svg+xml' });
        try {
          const { optimize } = await import('@/lib/engine-client');
          const optimized: string = await optimize(text, { preset: 1 });
          if (optimized && optimized.length > 100) svgBlob = new Blob([optimized], { type: 'image/svg+xml' });
        } catch {
          /* fallback: original SVG bytes */
        }
        const previewSvg = layersToSvg(layers, dims.w, dims.h);
        const previewBlob = new Blob([previewSvg], { type: 'image/svg+xml' });
        return {
          inputUrl: track(new Blob([bytes.buffer as ArrayBuffer], { type: 'image/svg+xml' })),
          outputUrl: track(previewBlob),
          svgText: previewSvg,
          width: dims.w,
          height: dims.h,
          layers,
          blobs: {
            'dxf-r2000': { blob: r2000, filename: `${base}-cleanpaths-r2000.dxf` },
            'dxf-r12': { blob: r12, filename: `${base}-cleanpaths-r12.dxf` },
            svg: { blob: svgBlob, filename: `${base}-cleanpaths.svg` },
          },
        };
        // eslint-disable-next-line no-unreachable
        function svgDims(t: string) {
          const w = parseFloat(t.match(/width="([\d.]+)/)?.[1] || '');
          const h = parseFloat(t.match(/height="([\d.]+)/)?.[1] || '');
          const vb = t.match(/viewBox="([\d.\s-]+)"/)?.[1]?.split(/[\s]+/).map(parseFloat);
          return { w: isFinite(w) ? w : vb?.[2] ?? 300, h: isFinite(h) ? h : vb?.[3] ?? 150 };
        }
        function stepForPrecision(v: number) {
          return Math.max(0.2, 1.7 - v * 0.15);
        }
      }

      // raster trace path (home / png / jpg / screenshot)
      const preset = kind === 'screenshot' && S.presetOn ? ('screenshot' as const) : undefined;
      let input = bytes;
      let inputMime = mime;
      prog?.enter('prep'); // 07d
      if (S.aiHdOn) {
        input = await preprocessImage(bytes, mime, 4);
        inputMime = 'image/png';
      } else if (kind === 'trace-raster' && S.cleanupOn && !S.sizeNote && (extOf(name) === '.jpg' || extOf(name) === '.jpeg')) {
        // cleanup 2x upscale is skipped when the #18 guard already downscaled
        // (upscaling back to 4000px would defeat the guard)
        input = await preprocessImage(bytes, mime, 2);
        inputMime = 'image/png';
      }
      prog?.enter('trace'); // 07d: engine worker — real phase events bump the bar
      const traced = await traceImage(input, inputMime, {
        preset,
        ...precisionConfig(S.precision, preset),
        // #82 param panel (/png-to-dxf/ only): Color threshold slider is the UI
        // source of truth for colorPrecision (it tracks the Precision slider's
        // linked value until the user overrides it); Mode seg maps to
        // hierarchical (cut=Cutout(1), engrave=Stacked(0)). Non-panel pages:
        // zero change — the spread below is skipped entirely.
        ...(props.paramPanel
          ? { colorPrecision: S.colorThreshold, hierarchical: S.mode === 'engrave' ? 0 : 1 }
          : {}),
        onPhase: (phase) => {
          // real worker events: WASM bundle load vs actual trace start
          if (phase === 'engine-loading') prog?.phaseProgress(0.04);
          else if (phase === 'tracing') prog?.phaseProgress(0.18);
        },
      });
      prog?.enter('paths'); // 07d: flatten — real 0..1 progress from the worker
      // #82: Node smoothing parameterizes the flatten sampling step on the
      // raster path (5 = legacy 0.8; higher = larger step = fewer nodes).
      const rasterStep = props.paramPanel ? Math.min(2, Math.max(0.2, (0.8 * S.smooth) / 5)) : 0.8;
      const layers = await flattenSvgAsync(traced.svg, { step: rasterStep, dropBackground: true, onProgress: (f) => prog?.phaseProgress(f) });
      if (layers.length === 0) throw new Error('trace produced no layers');
      prog?.enter('export');
      const prepared = prepareLayers(layers);
      // #82: mm width → DXF scale. Width semantics = geometry span (bbox),
      // not canvas — the cutter cuts the shape, not the page. R2000 carries
      // $INSUNITS=4 mm; R12 stores the same scaled coordinates.
      const geo = geoDims(prepared);
      const dxfScale = props.paramPanel && S.widthMm && S.widthMm > 0 && geo.w > 0 ? S.widthMm / geo.w : PX_TO_MM;
      const r2000 = new Blob([buildDxf(prepared, 'R2000', true, dxfScale)], { type: 'application/dxf' });
      const r12 = new Blob([buildDxf(prepared, 'R12', true, dxfScale)], { type: 'application/dxf' });
      const svgBlob = new Blob([traced.svg], { type: 'image/svg+xml' });
      return {
        inputUrl: track(new Blob([bytes.buffer as ArrayBuffer], { type: mime })),
        outputUrl: track(svgBlob),
        svgText: traced.svg,
        width: traced.width,
        height: traced.height,
        layers,
        prepared,
        geoW: geo.w,
        geoH: geo.h,
        blobs: {
          'dxf-r2000': { blob: r2000, filename: `${base}-cleanpaths-r2000.dxf` },
          'dxf-r12': { blob: r12, filename: `${base}-cleanpaths-r12.dxf` },
          svg: { blob: svgBlob, filename: `${base}-cleanpaths.svg` },
        },
      };
    }

    function renderState(state: string, html: string) {
      dz.dataset.state = state;
      dz.classList.remove('matgrid');
      if (state === 'processing') dz.classList.add('proc');
      else dz.classList.remove('proc');
      dz.innerHTML = html;
      setBusy(state === 'processing' || state === 'result');
      // 05 v1.6: reset button now lives on BOTH error and result states
      // (result previously had no way to convert another file without refresh).
      dz.querySelector('[data-tool-reset]')?.addEventListener('click', reset);
      if (state === 'processing') {
        // 05 v1.6: cancel affordance — invalidate the run and go back to idle.
        dz.querySelector('[data-tool-cancel]')?.addEventListener('click', reset);
        dz.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }

    function reset() {
      runSeq++; // 05 v1.6: invalidate any in-flight run (its late outcome is discarded)
      if (watchdog) { clearTimeout(watchdog); watchdog = null; }
      activeProg?.stop();
      activeProg = null;
      dz.dataset.state = 'empty';
      dz.classList.remove('proc');
      dz.classList.add('matgrid');
      dz.innerHTML = S.initialHtml ?? dz.innerHTML;
      S.out = null;
      S.aiHdOn = false;
      S.sizeNote = null;
      wireStatic();
      setBusy(false);
    }

    function renderResult() {
      const out = S.out;
      if (!out) return;
      const c = STATE_COPY[lang];
      const dxfDual = kind !== 'screenshot' && kind !== 'jfif' && kind !== 'jfif-png' && kind !== 'webp-svg';
      const downloads: ResultRender['downloads'] = [];
      if (kind === 'jfif' || kind === 'jfif-png') {
        if (kind === 'jfif-png') {
          downloads.push({ key: 'png', label: lang === 'pt' ? DL_COPY.png_pt : DL_COPY.png, primary: true });
        } else {
          downloads.push({ key: 'jpg', label: lang === 'pt' ? DL_COPY.jpg_pt : DL_COPY.jpg, primary: true });
        }
      } else if (dxfDual) {
        const r2000First = S.segVersion === 'R2000';
        downloads.push(
          { key: 'dxf-r2000', label: DL_COPY.dxf_r2000, primary: r2000First },
          { key: 'dxf-r12', label: DL_COPY.dxf_r12, primary: !r2000First },
          { key: 'svg', label: DL_COPY.svg, primary: false, ghost: true },
        );
      } else {
        downloads.push({ key: 'svg', label: lang === 'pt' ? DL_COPY.svg_pt : DL_COPY.svg, primary: true });
      }

      const tries = hdTriesLeft();
      const render: ResultRender = {
        inputUrl: out.inputUrl,
        outputUrl: out.outputUrl,
        layersNoteHtml: out.layersNoteHtml,
        layers: out.layers.map((l) => ({ hex: l.hex, name: l.hex })),
        extraLayers: Math.max(0, out.layers.length - 2),
        showPrecision: kind !== 'jfif' && kind !== 'jfif-png',
        precisionValue: S.precision,
        showAiHd: kind === 'trace-multi' || kind === 'trace-raster' || kind === 'screenshot' || kind === 'webp-svg',
        hdTries: tries,
        downloads,
        lang,
        // #82: panel renders only when the page opted in AND we have real
        // traced dimensions (raster path always sets width/height > 0).
        paramPanel:
          props.paramPanel && (out.geoW ?? 0) > 0
            ? {
                widthMm: S.widthMm ?? (out.geoW as number) * PX_TO_MM,
                widthPx: out.geoW as number,
                heightPx: out.geoH as number,
                threshold: S.colorThreshold,
                smooth: S.smooth,
                mode: S.mode,
              }
            : undefined,
      };
      dz.dataset.state = 'result';
      dz.classList.remove('proc', 'matgrid');
      dz.style.borderStyle = 'solid';
      dz.style.borderColor = 'var(--mat)';
      dz.innerHTML = resultHtml(render);
      if (S.sizeNote) dz.querySelector('.dl-row')?.insertAdjacentHTML('beforebegin', sizeNoteHtml(S.sizeNote));
      wireResult();
      setBusy(true);
      void c; // (kept for future frozen fragments)
    }

    function wireResult() {
      // 05 v1.6 reset button lives on the result state too — wire it here because
      // renderResult() bypasses renderState() (where the error-state wiring lives).
      dz.querySelector('[data-tool-reset]')?.addEventListener('click', reset);
      // downloads
      dz.querySelectorAll<HTMLButtonElement>('[data-tool-dl]').forEach((btn) => {
        btn.onclick = () => {
          const key = btn.dataset.toolDl!;
          const entry = S.out?.blobs[key];
          if (!entry) return;
          const a = document.createElement('a');
          a.href = URL.createObjectURL(entry.blob);
          a.download = entry.filename;
          a.click();
          setTimeout(() => URL.revokeObjectURL(a.href), 4000);
          setBusy(false); // result downloaded → FAB exits quiet state
        };
      });
      // precision slider
      const slider = dz.querySelector<HTMLInputElement>('[data-tool-precision]');
      if (slider) {
        let t: ReturnType<typeof setTimeout>;
        slider.oninput = () => {
          clearTimeout(t);
          t = setTimeout(() => {
            S.precision = parseInt(slider.value, 10);
            // #82: on panel pages the Color threshold slider tracks the
            // Precision-linked colorPrecision (precisionConfig itself is
            // untouched — this is UI sync only, zero behavior change for the
            // slider's existing linkage).
            if (props.paramPanel) {
              S.colorThreshold = precisionConfig(S.precision).colorPrecision ?? S.colorThreshold;
              const ts = dz.querySelector<HTMLInputElement>('[data-tool-threshold]');
              if (ts) ts.value = String(S.colorThreshold);
            }
            void rerun();
          }, 250);
        };
      }
      // ---- #82 param panel (05 v1.12, /png-to-dxf/ only) ----
      const panel = dz.querySelector<HTMLElement>('[data-tool-parampanel]');
      if (panel) {
        // P-W mm width: in-memory DXF rebuild, NO pipeline rerun (<50ms).
        const widthInput = panel.querySelector<HTMLInputElement>('[data-tool-width]');
        if (widthInput) {
          let t: ReturnType<typeof setTimeout>;
          widthInput.oninput = () => {
            clearTimeout(t);
            t = setTimeout(() => {
              const v = parseFloat(widthInput.value);
              if (!isFinite(v) || v <= 0) return; // keep last valid value
              S.widthMm = v;
              rebuildDxfBlobs();
            }, 250);
          };
        }
        // P-T color threshold: full pipeline rerun (same interaction as the
        // Precision slider — 250ms debounce → rerun()).
        const threshold = panel.querySelector<HTMLInputElement>('[data-tool-threshold]');
        if (threshold) {
          let t: ReturnType<typeof setTimeout>;
          threshold.oninput = () => {
            clearTimeout(t);
            t = setTimeout(() => {
              S.colorThreshold = parseInt(threshold.value, 10);
              void rerun();
            }, 250);
          };
        }
        // P-N node smoothing: flatten-step rerun (phase-1 bound to full rerun
        // per proposal §4; decoupling is a phase-2 item).
        const smooth = panel.querySelector<HTMLInputElement>('[data-tool-smooth]');
        if (smooth) {
          let t: ReturnType<typeof setTimeout>;
          smooth.oninput = () => {
            clearTimeout(t);
            t = setTimeout(() => {
              S.smooth = parseInt(smooth.value, 10);
              void rerun();
            }, 250);
          };
        }
        // P-M mode seg: cut=Cutout(1) / engrave=Stacked(0) → full rerun.
        panel.querySelectorAll<HTMLButtonElement>('[data-tool-mode] button').forEach((btn) => {
          btn.onclick = (e) => {
            e.stopPropagation();
            const m = btn.dataset.mode === 'engrave' ? 'engrave' : 'cut';
            if (m === S.mode) return;
            S.mode = m;
            panel.querySelectorAll('[data-tool-mode] button').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
            void rerun();
          };
        });
      }
      // AI HD rescue
      const aihd = dz.querySelector<HTMLElement>('[data-tool-aihd]');
      if (aihd) {
        aihd.onclick = (e) => {
          e.preventDefault();
          if (S.aiHdOn) {
            S.aiHdOn = false;
            aihd.classList.add('off');
            void rerun();
            return;
          }
          const left = hdTriesLeft();
          if (!isProActive() && left <= 0) {
            window.location.href = '/pricing/';
            return;
          }
          if (!consumeHdTry()) {
            window.location.href = '/pricing/';
            return;
          }
          S.aiHdOn = true;
          aihd.classList.remove('off');
          const badge = aihd.querySelector('[data-tool-aihd-badge]');
          if (badge) badge.textContent = isProActive() ? 'PRO' : `${hdTriesLeft()} / 3 FREE TRIES LEFT`;
          void rerun();
        };
      }
      // share block removed (05 v1.6, 2026-10-14 user decision — makers share
      // their output file, not the tool site; download buttons cover it).
      // result feedback form
      const fb = dz.querySelector<HTMLElement>('[data-tool-feedback]');
      if (fb) {
        let rating: string | null = null;
        fb.querySelectorAll<HTMLButtonElement>('.emoji').forEach((b) => {
          b.onclick = () => {
            fb.querySelectorAll('.emoji').forEach((x) => x.setAttribute('aria-pressed', 'false'));
            b.setAttribute('aria-pressed', 'true');
            rating = b.textContent?.trim() ?? null;
          };
        });
        fb.querySelector<HTMLButtonElement>('[data-fb-submit]')!.onclick = async () => {
          try {
            const res = await fetch('/api/feedback', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({
                kind: 'inline',
                context: 'result',
                rating,
                message: fb.querySelector('textarea')?.value ?? '',
                showcase_optin: false, // 05 v1.6: opt-in checkbox removed with the share block
                page: window.location.pathname,
                lang: document.documentElement.lang || lang,
                ts: new Date().toISOString(),
              }),
            });
            if (res.ok) fb.innerHTML = feedbackOkHtml(lang);
            else openFeedbackDialog();
          } catch {
            openFeedbackDialog();
          }
        };
      }
    }

    async function rerun() {
      if (!S.lastFile) return;
      try {
        S.out = await produce(S.lastFile.bytes, S.lastFile.name, S.lastFile.mime);
        renderResult();
      } catch (err) {
        console.error('[cleanpaths] re-run failed', err);
      }
    }

    // #82 P-W: rebuild both DXF blobs from the in-memory prepared layers with
    // the user-set mm width — main-thread string assembly only (<50ms), no
    // worker round-trip, no pipeline rerun (open-items #18 compliant).
    function rebuildDxfBlobs() {
      const out = S.out;
      if (!out?.prepared || !S.widthMm || S.widthMm <= 0 || (out.geoW ?? 0) <= 0) return;
      const geoW = out.geoW as number;
      const geoH = out.geoH as number;
      const base = baseOf(S.lastFile?.name ?? 'image');
      const scale = S.widthMm / geoW;
      out.blobs['dxf-r2000'] = {
        blob: new Blob([buildDxf(out.prepared, 'R2000', true, scale)], { type: 'application/dxf' }),
        filename: `${base}-cleanpaths-r2000.dxf`,
      };
      out.blobs['dxf-r12'] = {
        blob: new Blob([buildDxf(out.prepared, 'R12', true, scale)], { type: 'application/dxf' }),
        filename: `${base}-cleanpaths-r12.dxf`,
      };
      // read-only size line (N3 frozen template, {w}/{h} are data)
      const sizeEl = dz.querySelector<HTMLElement>('[data-tool-output-size]');
      if (sizeEl) {
        const fmtMm = (n: number) => (Math.round(n * 10) / 10).toString();
        sizeEl.textContent = STATE_COPY.en.output_size_tpl
          .replace('{w}', fmtMm(S.widthMm))
          .replace('{h}', fmtMm((S.widthMm * geoH) / geoW));
      }
    }

    return () => {
      dz.removeEventListener('dragover', onDragOver);
      dz.removeEventListener('dragleave', onDragLeave);
      dz.removeEventListener('drop', onDrop);
      S.urls.forEach((u) => URL.revokeObjectURL(u));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The dropzone itself lives in the extracted static HTML; this component
  // only wraps the page <main> to gain a mount point.
  return <div ref={rootRef} style={{ display: 'contents' }} data-tool-controller />;
}

function guessMime(ext: string): string {
  if (ext === '.png') return 'image/png';
  if (ext === '.svg') return 'image/svg+xml';
  return 'image/jpeg';
}
