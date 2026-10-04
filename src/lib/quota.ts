/**
 * quota.ts — Free tier limiter (03 收敛口径): localStorage daily counter,
 * 10 conversions/day. The IP-hash second factor is an 08 Workers concern
 * (integration point: X-CP-Quota header contract). No browser fingerprinting.
 * license.ts — Pro entitlement gate (04 §4.3/§7): license key stored locally,
 * verified via POST /api/license/verify (08 placeholder). Offline after
 * one-time activation.
 */

const CAP = 10;
const DAY = () => new Date().toISOString().slice(0, 10);
const KEY_COUNT = `cp.free.count`;
const KEY_DAY = `cp.free.day`;
const KEY_PRO = 'cp.pro.license';
const KEY_PRO_OK = 'cp.pro.verified';
const KEY_HD_TRIES = 'cp.hd.tries';
const HD_TRIES = 3;

export interface QuotaState {
  used: number;
  cap: number;
  pro: boolean;
  allowed: boolean;
}

export function getQuota(): QuotaState {
  if (typeof localStorage === 'undefined') return { used: 0, cap: CAP, pro: false, allowed: true };
  const day = localStorage.getItem(KEY_DAY);
  let used = 0;
  if (day === DAY()) used = parseInt(localStorage.getItem(KEY_COUNT) || '0', 10) || 0;
  const pro = isProActive();
  return { used, cap: CAP, pro, allowed: pro || used < CAP };
}

/** Record one successful conversion. No-op for Pro. */
export function recordConversion(): QuotaState {
  const q = getQuota();
  if (q.pro) return q;
  if (localStorage.getItem(KEY_DAY) !== DAY()) {
    localStorage.setItem(KEY_DAY, DAY());
    localStorage.setItem(KEY_COUNT, '0');
  }
  localStorage.setItem(KEY_COUNT, String((parseInt(localStorage.getItem(KEY_COUNT) || '0', 10) || 0) + 1));
  return getQuota();
}

// ---------------------------------------------------------------- license ---

export function getLicenseKey(): string | null {
  try {
    return localStorage.getItem(KEY_PRO);
  } catch {
    return null;
  }
}

export function isProActive(): boolean {
  try {
    return Boolean(localStorage.getItem(KEY_PRO) && localStorage.getItem(KEY_PRO_OK) === '1');
  } catch {
    return false;
  }
}

/**
 * Capture ?license= from checkout success redirect (08 contract), store,
 * attempt one-time online activation. Until the 08 endpoint exists the key
 * stays stored but unverified — Pro features remain locked (honest state).
 */
export async function captureLicenseFromUrl(): Promise<void> {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  const key = url.searchParams.get('license');
  if (!key) return;
  localStorage.setItem(KEY_PRO, key);
  url.searchParams.delete('license');
  window.history.replaceState(null, '', url.toString());
  await verifyLicense();
}

export async function verifyLicense(): Promise<boolean> {
  const key = getLicenseKey();
  if (!key) return false;
  try {
    const res = await fetch('/api/license/verify', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ license_key: key }),
    });
    if (res.ok) {
      const data = (await res.json()) as { valid?: boolean };
      if (data.valid) {
        localStorage.setItem(KEY_PRO_OK, '1');
        return true;
      }
    }
  } catch {
    /* 08 endpoint not wired yet */
  }
  return false;
}

// ------------------------------------------------------------- HD tries ---

export function hdTriesLeft(): number {
  if (isProActive()) return Infinity;
  try {
    const v = parseInt(localStorage.getItem(KEY_HD_TRIES) || '', 10);
    return isFinite(v) ? Math.max(0, v) : HD_TRIES;
  } catch {
    return HD_TRIES;
  }
}

export function consumeHdTry(): boolean {
  if (isProActive()) return true;
  const left = hdTriesLeft();
  if (left <= 0) return false;
  localStorage.setItem(KEY_HD_TRIES, String(left - 1));
  return true;
}
