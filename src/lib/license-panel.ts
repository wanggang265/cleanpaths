'use client';

/**
 * license-panel.ts — shared wiring for the 05 v1.5 license activation entry.
 * Used by BOTH approved entry points (zhongshu 裁决 §D-3):
 *   1. tool-page cap state ([data-license-entry] rendered by capHtml)
 *   2. /pricing checkout-success return state (next to the toast)
 * All visible strings come from LICENSE_COPY (frozen, verbatim); this module
 * only assembles templates from state-templates.ts and calls quota.ts.
 *
 * Failure tracks (zhongshu 裁决 §D-1): verifyLicense() returns
 * 'ok' | 'invalid' | 'transient' — 'invalid' renders err_invalid,
 * 'transient' renders err_network. Never collapse the two.
 */
import { getEntitlement, setLicenseKey, verifyLicense } from '@/lib/quota';
import { licenseCheckingHtml, licenseErrorHtml, licenseOkHtml, licensePanelHtml, proActiveHtml } from '@/components/tool/state-templates';

export interface LicensePanelHandle {
  /** Render proActiveHtml badges at the top of the tool dropzone (ToolController passes this). */
  onActivated?: () => void;
}

function submit(panel: HTMLElement, lang: 'en' | 'pt', onActivated?: () => void): void {
  const input = panel.querySelector<HTMLInputElement>('[data-license-input]');
  const status = panel.querySelector<HTMLElement>('[data-license-status]');
  const btn = panel.querySelector<HTMLButtonElement>('[data-license-submit]');
  if (!input || !status || !btn) return;
  const key = input.value.trim();
  if (!key) return;
  btn.disabled = true;
  status.innerHTML = licenseCheckingHtml(lang);
  setLicenseKey(key);
  void verifyLicense().then((result) => {
    btn.disabled = false;
    if (result === 'ok') {
      const ent = getEntitlement();
      const pro = ent.tier === 'pro_core' || ent.tier === 'monthly_pass';
      // ok_main + ok_pro/ok_pack 分轨（05 v1.5 §B-6）；冻结徽章行紧随其后（§C）。
      status.innerHTML = licenseOkHtml(lang, { pro, packs: ent.packs }) + (pro ? proActiveHtml(lang) : '');
      onActivated?.();
      return;
    }
    status.innerHTML = licenseErrorHtml(lang, result === 'invalid' ? 'invalid' : 'network');
  });
}

/**
 * Wire a [data-license-entry] toggle + panel inside `scope`. Idempotent per
 * scope subtree: safe to call after every state re-render.
 */
export function wireLicenseEntry(scope: ParentNode, lang: 'en' | 'pt', onActivated?: () => void): void {
  const entry = scope.querySelector<HTMLButtonElement>('[data-license-entry]');
  const panelHost = scope.querySelector<HTMLElement>('[data-license-panel]');
  if (!entry || !panelHost || entry.dataset.wired === '1') return;
  entry.dataset.wired = '1';
  entry.addEventListener('click', (e) => {
    e.stopPropagation();
    if (panelHost.hidden) {
      panelHost.innerHTML = licensePanelHtml(lang);
      panelHost.hidden = false;
      const panel = panelHost;
      panel.querySelector<HTMLButtonElement>('[data-license-submit]')?.addEventListener('click', (ev) => {
        ev.stopPropagation();
        submit(panel, lang, onActivated);
      });
      panel.querySelector<HTMLInputElement>('[data-license-input]')?.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter') {
          ev.preventDefault();
          submit(panel, lang, onActivated);
        }
      });
    } else {
      panelHost.hidden = true;
    }
  });
}
