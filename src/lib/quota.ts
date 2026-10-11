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
const KEY_ENTITLEMENT = 'cp.pro.entitlement';
const KEY_INSTANCES = 'cp.pro.instances';
const KEY_HD_TRIES = 'cp.hd.tries';
const HD_TRIES = 3;

export type EntitlementTier = 'pro_core' | 'monthly_pass' | 'pack';
export type EntitlementPack = 'batch' | 'precision';

/** 04 §7 entitlement (local, no account system): accumulated across keys. */
export interface Entitlement {
  tier: EntitlementTier | null;
  packs: EntitlementPack[];
  updated_at: string;
}

interface InstanceRecord {
  instance_name: string;
  instance_id: string | null;
}

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

// ------------------------------------------------------ entitlement (08) ---

const EMPTY_ENTITLEMENT: Entitlement = { tier: null, packs: [], updated_at: '' };

export function getEntitlement(): Entitlement {
  try {
    const raw = localStorage.getItem(KEY_ENTITLEMENT);
    if (!raw) return { ...EMPTY_ENTITLEMENT };
    const parsed = JSON.parse(raw) as Partial<Entitlement>;
    return {
      tier: parsed.tier ?? null,
      packs: Array.isArray(parsed.packs) ? (parsed.packs as EntitlementPack[]) : [],
      updated_at: typeof parsed.updated_at === 'string' ? parsed.updated_at : '',
    };
  } catch {
    return { ...EMPTY_ENTITLEMENT };
  }
}

/** Add-on pack unlock (04 §1.2): Batch queue / Precision advanced tiers. */
export function hasPack(pack: EntitlementPack): boolean {
  return getEntitlement().packs.includes(pack);
}

function readInstances(): Record<string, InstanceRecord> {
  try {
    return (JSON.parse(localStorage.getItem(KEY_INSTANCES) || '{}') as Record<string, InstanceRecord>) ?? {};
  } catch {
    return {};
  }
}

function instanceNameFor(key: string): InstanceRecord {
  const all = readInstances();
  const existing = all[key];
  if (existing?.instance_name) return existing;
  const rec: InstanceRecord = {
    instance_name: `cleanpaths-web-${crypto.randomUUID()}`,
    instance_id: null,
  };
  all[key] = rec;
  try {
    localStorage.setItem(KEY_INSTANCES, JSON.stringify(all));
  } catch {
    /* storage full/blocked — activation still works online */
  }
  return rec;
}

function saveInstanceId(key: string, instanceId: string | null): void {
  if (!instanceId) return;
  const all = readInstances();
  if (!all[key]) return;
  all[key] = { ...all[key], instance_id: instanceId };
  try {
    localStorage.setItem(KEY_INSTANCES, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

/** tier precedence: pro_core > monthly_pass > pack (cap removal is Core/Pass only, 04 §1.2). */
function tierRank(t: EntitlementTier | null): number {
  return t === 'pro_core' ? 3 : t === 'monthly_pass' ? 2 : t === 'pack' ? 1 : 0;
}

function mergeEntitlement(tier: EntitlementTier | null, packs: EntitlementPack[]): void {
  const cur = getEntitlement();
  const merged: Entitlement = {
    tier: tierRank(tier) >= tierRank(cur.tier) ? tier : cur.tier,
    packs: Array.from(new Set([...cur.packs, ...packs])),
    updated_at: new Date().toISOString(),
  };
  try {
    localStorage.setItem(KEY_ENTITLEMENT, JSON.stringify(merged));
  } catch {
    /* ignore */
  }
}

function clearEntitlement(): void {
  try {
    localStorage.removeItem(KEY_ENTITLEMENT);
    localStorage.removeItem(KEY_PRO_OK);
  } catch {
    /* ignore */
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

interface VerifyResponse {
  ok?: boolean;
  valid?: boolean;
  status?: string;
  tier?: EntitlementTier | null;
  packs?: EntitlementPack[];
  instance_id?: string | null;
}

/**
 * One-time online activation / re-validation via /api/license/verify
 * (08: server proxies Creem; the API key never reaches the browser).
 * First call on a device sends instance_name (activate); once Creem returns
 * an instance_id we send that instead (validate). A valid response merges
 * tier/packs into the local entitlement (04 §7) and clears the daily cap;
 * an explicit invalid (refunded/deactivated/revoked) clears it again.
 */
export async function verifyLicense(): Promise<boolean> {
  const key = getLicenseKey();
  if (!key) return false;
  const inst = instanceNameFor(key);
  try {
    const res = await fetch('/api/license/verify', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(
        inst.instance_id
          ? { license_key: key, instance_id: inst.instance_id }
          : { license_key: key, instance_name: inst.instance_name },
      ),
    });
    if (!res.ok) return false; // 429/5xx — transient, keep current local state
    const data = (await res.json()) as VerifyResponse;
    if (data.valid) {
      mergeEntitlement(data.tier ?? null, Array.isArray(data.packs) ? data.packs : []);
      // Cap removal + unlimited AI HD are Core/Monthly-Pass rights ONLY
      // (04 §1.2) — a pack-only key must not flip isProActive().
      const t = getEntitlement().tier;
      if (t === 'pro_core' || t === 'monthly_pass') {
        localStorage.setItem(KEY_PRO_OK, '1');
      }
      saveInstanceId(key, data.instance_id ?? null);
      return true;
    }
    if (data.ok) {
      // Server reached Creem and the answer was a definitive "not active".
      clearEntitlement();
    }
  } catch {
    /* offline — local entitlement stands (one-time purchase promise) */
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
