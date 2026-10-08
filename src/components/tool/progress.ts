/**
 * progress.ts — 07d real staged conversion progress (replaces the static
 * 62% "fake spinner" bar). Stages are driven by REAL events:
 *   - ToolController pipeline boundaries (read → prep → trace → paths → export)
 *   - engine-worker phase messages ({id, phase:'engine-loading'|'tracing'})
 *   - flatten-worker real 0..1 progress (already shipped in 07c)
 * Within a stage the bar sits at the stage base with the live stripe
 * animation; real sub-progress advances it where the worker reports it.
 * The elapsed-seconds ticker is the always-moving honesty signal.
 *
 * ⚠ ALL COPY IN THIS FILE IS NEW — [NEEDS-COPY-REVIEW]
 *   Route through zhongshu/05c before any freeze. Frozen copy in
 *   src/lib/copy.ts is untouched; the frozen STEPS list remains as the
 *   no-JS fallback inside state-templates.processingHtml.
 */

export interface PhaseDef {
  id: string;
  en: string;
  pt: string;
  /** bar range [from, to) in percent */
  from: number;
  to: number;
}

/** [NEEDS-COPY-REVIEW] raster trace pipeline stage names (EN + PT) */
export const TRACE_PHASES: readonly PhaseDef[] = [
  { id: 'read', en: 'Reading image', pt: 'Lendo a imagem', from: 0, to: 6 },
  { id: 'prep', en: 'Preparing image', pt: 'Preparando a imagem', from: 6, to: 14 },
  { id: 'trace', en: 'Tracing paths', pt: 'Traçando os contornos', from: 14, to: 70 },
  { id: 'paths', en: 'Building cut paths', pt: 'Gerando os caminhos de corte', from: 70, to: 95 },
  { id: 'export', en: 'Preparing downloads', pt: 'Preparando os downloads', from: 95, to: 100 },
] as const;

/** [NEEDS-COPY-REVIEW] svg → dxf pipeline stage names (EN + PT) */
export const SVG_PHASES: readonly PhaseDef[] = [
  { id: 'read', en: 'Reading file', pt: 'Lendo o arquivo', from: 0, to: 8 },
  { id: 'paths', en: 'Converting curves to cut paths', pt: 'Convertendo curvas em caminhos de corte', from: 8, to: 92 },
  { id: 'export', en: 'Preparing downloads', pt: 'Preparando os downloads', from: 92, to: 100 },
] as const;

/** [NEEDS-COPY-REVIEW] elapsed-time line. {s} = whole seconds. */
export const ELAPSED_FMT = {
  en: (s: number) => `${s}s elapsed`,
  pt: (s: number) => `${s}s decorridos`,
} as const;

/**
 * [NEEDS-COPY-REVIEW] honest expectation for big files (shown only when the
 * #18 guard actually downscaled the input — i.e. we KNOW it is big).
 */
export const BIGFILE_NOTE = {
  en: 'Large file — this can take 1–2 minutes. Still running on your device; you can keep this tab open.',
  pt: 'Arquivo grande — pode levar de 1 a 2 minutos. Ainda está rodando no seu navegador; pode deixar esta aba aberta.',
} as const;

export interface ProgressUI {
  /** mark `id` active; every phase before it becomes done (skip-safe) */
  enter(id: string): void;
  /** real 0..1 progress inside the active phase (from a worker message) */
  phaseProgress(frac: number): void;
  /** show the big-file honest-expectation note (idempotent) */
  bigFile(): void;
  /** bar → 100%, all done, stop the clock */
  finish(): void;
  /** stop the clock (error / abandon paths) */
  stop(): void;
}

/**
 * Wire the processing-state DOM rendered by state-templates.processingHtml.
 * Returns null when the expected hooks are absent (defensive — callers then
 * behave exactly as before 07d).
 */
export function createProgressUI(
  root: HTMLElement,
  phases: readonly PhaseDef[],
  lang: 'en' | 'pt',
): ProgressUI | null {
  const bar = root.querySelector<HTMLElement>('[data-tool-bar]');
  const stepsEl = root.querySelector<HTMLElement>('[data-tool-steps]');
  const elapsedEl = root.querySelector<HTMLElement>('[data-tool-elapsed]');
  const noteEl = root.querySelector<HTMLElement>('[data-tool-bignote]');
  if (!bar || !stepsEl) return null;

  // live phase rows replace the frozen static fallback list
  stepsEl.innerHTML = phases
    .map((p) => `<span data-phase="${p.id}">○ ${p[lang]}</span>`)
    .join('\n');
  const rowOf = (id: string) => stepsEl.querySelector<HTMLElement>(`[data-phase="${id}"]`);

  let active = -1;
  let timer: ReturnType<typeof setInterval> | null = null;
  const t0 = Date.now();

  const setBar = (pct: number) => {
    bar.style.width = `${Math.max(0, Math.min(100, pct)).toFixed(1)}%`;
  };
  const paint = () => {
    phases.forEach((p, i) => {
      const row = rowOf(p.id);
      if (!row) return;
      if (i < active) {
        row.className = 'done';
        row.textContent = `✓ ${p[lang]}`;
      } else if (i === active) {
        row.className = 'now';
        row.textContent = `▸ ${p[lang]}`;
      } else {
        row.className = '';
        row.textContent = `○ ${p[lang]}`;
      }
    });
  };
  const tick = () => {
    if (elapsedEl) {
      elapsedEl.hidden = false;
      elapsedEl.textContent = ELAPSED_FMT[lang](Math.floor((Date.now() - t0) / 1000));
    }
  };

  // start the clock immediately — the always-moving honesty signal
  tick();
  timer = setInterval(tick, 500);

  const stopTimer = () => {
    if (timer) clearInterval(timer);
    timer = null;
  };

  return {
    enter(id) {
      const idx = phases.findIndex((p) => p.id === id);
      if (idx === -1) return;
      active = idx;
      setBar(phases[idx].from);
      paint();
    },
    phaseProgress(frac) {
      if (active < 0) return;
      const p = phases[active];
      setBar(p.from + Math.max(0, Math.min(1, frac)) * (p.to - p.from));
    },
    bigFile() {
      if (!noteEl || noteEl.firstChild) return;
      const div = document.createElement('div');
      div.className = 'state-note state-note--info';
      div.style.marginTop = '12px';
      const span = document.createElement('span');
      span.textContent = BIGFILE_NOTE[lang];
      div.appendChild(span);
      noteEl.appendChild(div);
    },
    finish() {
      active = phases.length;
      paint();
      setBar(100);
      stopTimer();
    },
    stop() {
      stopTimer();
    },
  };
}
