/**
 * state-templates.ts — HTML templates for live tool states.
 * Markup mirrors design-source/build/states_common.py exactly; all visible
 * strings come from src/lib/copy.ts (05 §11/§12 frozen). Dynamic values are
 * limited to data (colors, counts, URLs) — never copy.
 */
import { CAP_COPY, DL_COPY, FB_COPY, INLINE_FEEDBACK, LICENSE_COPY, SHARE_COPY, STATE_COPY } from '@/lib/copy';

export interface LayerRow {
  hex: string;
  name: string;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function processingHtml(steps: readonly string[], lang: 'en' | 'pt'): string {
  const c = STATE_COPY[lang];
  const rows = steps
    .map((s) => {
      const cls = s.startsWith('✓') ? 'done' : s.startsWith('▸') ? 'now' : '';
      return `<span${cls ? ` class="${cls}"` : ''}>${s}</span>`;
    })
    .join('\n    ');
  // 07d: data-tool-* hooks let progress.ts drive REAL staged progress
  // (bar width, live phase rows, elapsed clock, big-file note). The frozen
  // `steps` rows stay as the no-JS fallback — progress.ts replaces them.
  return `
  <div class="dz-text">${c.proc_main}</div>
  <div class="bar-outer"><div class="bar-inner" data-tool-bar style="width:2%"></div></div>
  <div class="steps-mini" data-tool-steps aria-live="polite">
    ${rows}
  </div>
  <div class="proc-elapsed" data-tool-elapsed hidden></div>
  <div data-tool-bignote></div>`;
}

export function errorHtml(message: string, lang: 'en' | 'pt'): string {
  const c = STATE_COPY[lang];
  return `
  <div class="state-note state-note--error"><b>!</b><span>${message}</span></div>
  <div style="margin-top:14px"><button class="btn" type="button" data-tool-reset>${c.err_btn}</button></div>`;
}

export function capHtml(lang: 'en' | 'pt'): string {
  if (lang === 'pt') {
    const c = CAP_COPY.pt;
    return `
  <div class="state-note state-note--cap"><span class="badge" aria-label="${c.aria}"><b>${c.badge}</b></span><span>${c.main}</span></div>
  <div class="dl-row" style="justify-content:center">
    <a class="btn btn--ghost" href="/pricing/">${c.cta}</a>
  </div>
  <div style="margin-top:10px;text-align:center"><button type="button" data-license-entry class="btn btn--ghost">${LICENSE_COPY.pt.entry}</button></div>
  <div data-license-panel hidden></div>
  <div class="dz-formats" style="margin-top:12px">${c.mono}</div>`;
  }
  const c = CAP_COPY.en;
  return `
  <div class="state-note state-note--cap"><span class="badge" aria-label="${c.aria}"><b>${c.badge}</b></span><span>${c.main}</span></div>
  <p style="margin-top:12px;font-size:15px;color:var(--ink-2)">${c.conv}</p>
  <div class="dl-row" style="justify-content:center">
    <a class="btn btn--primary" href="/pricing/">${c.cta_pro}</a>
    <a class="btn btn--ghost" href="/pricing/">${c.cta_pricing}</a>
  </div>
  <div style="margin-top:10px;text-align:center"><button type="button" data-license-entry class="btn btn--ghost">${LICENSE_COPY.en.entry}</button></div>
  <div data-license-panel hidden></div>
  <div class="dz-formats" style="margin-top:12px">${c.mono}</div>`;
}

// -------------------------------------------------- license panel (05 v1.5) ---

/**
 * License activation panel — string assembly pattern identical to
 * capHtml/errorHtml; all visible strings from LICENSE_COPY (05 v1.5 frozen,
 * verbatim). {PACKS} interpolation in ok_pack is DATA (frozen product names
 * from §4: 'Batch Pack' / 'Precision Pack'), not copy.
 */

/** Panel shell: label + input + submit. Mounted into [data-license-panel]. */
export function licensePanelHtml(lang: 'en' | 'pt'): string {
  const c = LICENSE_COPY[lang];
  return `
  <div class="state-note" style="text-align:left">
    <label class="spec" for="cp-license-input" style="margin-bottom:6px;display:block">${c.label}</label>
    <input id="cp-license-input" type="text" autocomplete="off" spellcheck="false" placeholder="${c.placeholder}" aria-label="${c.label}" data-license-input style="width:100%;box-sizing:border-box">
    <div style="margin-top:10px"><button class="btn btn--primary" type="button" data-license-submit>${c.submit}</button></div>
    <div data-license-status aria-live="polite" style="margin-top:10px"></div>
  </div>`;
}

/** In-place busy line while the verify request is in flight. */
export function licenseCheckingHtml(lang: 'en' | 'pt'): string {
  return `<span>${LICENSE_COPY[lang].checking}</span>`;
}

/**
 * Success replacement lines: ok_main always; ok_pro when the entitlement tier
 * is pro_core/monthly_pass; ok_pack (can co-render) when packs were unlocked.
 * The frozen proActiveHtml badge row renders right below (05 v1.5 §C).
 */
export function licenseOkHtml(lang: 'en' | 'pt', opts: { pro: boolean; packs: string[] }): string {
  const c = LICENSE_COPY[lang];
  const packNames = opts.packs
    .map((p) => (p === 'batch' ? 'Batch Pack' : p === 'precision' ? 'Precision Pack' : p))
    .join(' + ');
  const rows = [
    `<span><b>${c.ok_main}</b></span>`,
    opts.pro ? `<span style="display:block;margin-top:6px">${c.ok_pro}</span>` : '',
    packNames ? `<span style="display:block;margin-top:6px">${c.ok_pack.replace('{PACKS}', packNames)}</span>` : '',
  ];
  return rows.filter(Boolean).join('\n');
}

/** Inline error line under the input. kind: 'invalid' | 'network'. */
export function licenseErrorHtml(lang: 'en' | 'pt', kind: 'invalid' | 'network'): string {
  const c = LICENSE_COPY[lang];
  return `<div class="state-note state-note--error"><b>!</b><span>${kind === 'invalid' ? c.err_invalid : c.err_network}</span></div>`;
}

export function proActiveHtml(lang: 'en' | 'pt'): string {
  const c = STATE_COPY[lang];
  return `<div class="badges" style="justify-content:center;margin-bottom:12px"><span class="badge"><b>${c.pro_active}</b></span><span class="badge badge--soft">${c.pro_no_cap}</span><span class="badge badge--soft">${c.pro_offline}</span></div>`;
}

export interface ResultRender {
  inputUrl: string;
  outputUrl: string;
  /** shown instead of the layer rows when the output isn't layered (jfif) */
  layersNoteHtml?: string;
  layers: LayerRow[];
  extraLayers: number;
  showPrecision: boolean;
  precisionValue: number;
  showAiHd: boolean;
  hdTries: number; // Infinity for pro
  downloads: Array<{ key: string; label: string; primary: boolean; ghost?: boolean }>;
  lang: 'en' | 'pt';
}

export function resultHtml(r: ResultRender): string {
  // PT route is tool-light (05 §11.12-1): precision/AI-HD blocks never render
  // there (showAiHd/showPrecision=false), so narrowing to the EN shape is safe.
  const c = STATE_COPY[r.lang] as (typeof STATE_COPY)['en'];
  const share = SHARE_COPY[r.lang];
  const fb = INLINE_FEEDBACK;
  const fbc = FB_COPY[r.lang];

  const layerRows =
    r.layersNoteHtml ??
    r.layers
      .slice(0, 2)
      .map(
        (l, i) =>
          `<li><span class="sw" style="background:#${esc(l.hex)}"></span>layer-${i + 1} · #${esc(l.hex).toUpperCase()} · ${c.closed}</li>`,
      )
      .concat(r.extraLayers > 0 ? [`<li style="color:var(--ink-3)">… ${r.extraLayers} ${c.more_layers}</li>`] : [])
      .join('');

  const precision = r.showPrecision
    ? `
  <div style="margin-top:14px;text-align:left">
    <label class="spec" style="margin-bottom:6px">${c.precision}</label>
    <input type="range" min="1" max="10" value="${r.precisionValue}" style="width:100%;accent-color:#E4572E" aria-label="${c.precision}" data-tool-precision>
  </div>`
    : '';

  const aiHd = r.showAiHd
    ? `
  <div style="margin-top:14px;text-align:left">
    <label class="switch${r.hdTries === 0 ? ' off' : ''}" data-tool-aihd><span class="track"></span>${c.ai_hd} <span class="try-badge" data-tool-aihd-badge>${
      r.hdTries === Infinity ? 'PRO' : `${r.hdTries} / 3 FREE TRIES LEFT`
    }</span></label>
    <p style="margin-top:10px;font-size:14px;color:var(--ink-2)">${c.ai_hd_desc}</p>
  </div>`
    : '';

  const dlButtons = r.downloads
    .map(
      (d) =>
        `<button class="btn${d.primary ? ' btn--primary' : ''}${d.ghost ? ' btn--ghost' : ''}" type="button" data-tool-dl="${d.key}">${d.label}</button>`,
    )
    .join('\n');

  const prefill = share.x_prefill.replace(/ /g, '%20');

  return `
  <div class="result">
    <div class="panel">
      <div class="cap">${c.input_cap}</div>
      <img src="${r.inputUrl}" alt="input preview" style="aspect-ratio:4/3;object-fit:cover">
    </div>
    <div class="panel">
      <div class="cap">${c.output_cap}</div>
      <img src="${r.outputUrl}" alt="output preview" style="aspect-ratio:4/3;object-fit:cover">
    </div>
  </div>
  <ul class="layers" style="margin-top:14px;background:var(--paper);border:1.5px solid var(--line);border-radius:6px">
    ${layerRows}
  </ul>${precision}${aiHd}
  <div class="dl-row">${dlButtons}</div>
  <div class="share-block" data-visible-when="result">
  <div class="spec">${share.title}</div>
  <div class="share-row">
    <button class="btn btn--sm" type="button" data-share-copy>${share.copy}</button>
    <a class="btn btn--sm" href="https://x.com/intent/post?text=${prefill}" target="_blank" rel="noopener">${share.x}</a>
    <button class="btn btn--sm" type="button" data-share-img>${share.dl_img}</button>
  </div>
  <label class="share-optin">
    <input type="checkbox" data-share-optin>
    <span>${share.optin}<br><span class="micro">${share.optin_micro}</span></span>
  </label>
</div>
<div style="margin-top:16px" data-tool-feedback>
  <div class="feedback" data-context="result">
  <h3>${fb.heading}</h3>
  <div class="emojis" role="group" aria-label="Rate this result">
    ${fb.ratings.map((t) => `<button class="emoji" type="button" aria-pressed="false">${t.emoji} <span>${t.label}</span></button>`).join('\n    ')}
  </div>
  <textarea placeholder="${esc(fb.textareaPlaceholder)}" aria-label="Optional feedback"></textarea>
  <button class="btn btn--sm" type="button" data-fb-submit>${fbc.submit}</button>
</div></div>`;
}

export function feedbackOkHtml(lang: 'en' | 'pt'): string {
  return `<div class="feedback"><span class="ok">${INLINE_FEEDBACK.success[lang]}</span></div>`;
}

/** jfif repackage layer note — frozen states_common.py JFIF_LAYERS_EN */
export const JFIF_LAYER_NOTE =
  '<li><span class="sw" style="background:#E0E4EA"></span>container repackaged · .jfif → .jpg · image data untouched</li>';

export const DL = DL_COPY;
