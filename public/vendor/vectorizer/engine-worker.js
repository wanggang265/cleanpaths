/**
 * engine-worker.js — Web Worker wrapper around the vendored vectorizer bundle.
 * Loads the WASM engine inside the worker (main thread stays responsive),
 * exposes vectorize + optimize via postMessage RPC.
 *
 * Message protocol:
 *   → { id, action: 'vectorize', bytes: ArrayBuffer, config: object }
 *   ← { id, phase: 'engine-loading' }       (07d: only on first WASM load)
 *   ← { id, phase: 'tracing' }              (07d: engine loaded, trace starting)
 *   ← { id, ok: true, svg: string } | { id, ok: false, error: string }
 *   → { id, action: 'optimize', text: string, opts: object }
 *   ← { id, phase: 'optimizing' }           (07d)
 *   ← { id, ok: true, optimized: string } | { id, ok: false, error: string }
 *
 * Phase messages carry no `ok` field — clients must treat them as
 * informational progress events, never as completion.
 */

let enginePromise = null;
let engineLoadAttempt = 0;

function loadEngine(id) {
  if (!enginePromise) {
    // 07d: real phase event — first-run WASM fetch+compile is seconds-long
    self.postMessage({ id, phase: 'engine-loading' });
    // Rejected module evaluations stay in the worker's module map; a fresh query
    // lets the user's next manual retry re-run the bundle after a transient fetch failure.
    engineLoadAttempt += 1;
    enginePromise = import(`./vectorizer.bundle.js?engine-attempt=${engineLoadAttempt}`);
    // 拒绝态不得入缓存：瞬时网络失败不得毒化后续全部尝试
    enginePromise.catch(() => { enginePromise = null; });
  }
  return enginePromise;
}

self.onmessage = async (e) => {
  const { id, action } = e.data;
  try {
    const engine = await loadEngine(id);
    if (action === 'vectorize') {
      const { bytes, config } = e.data;
      self.postMessage({ id, phase: 'tracing' });
      const svg = await engine.vectorize(new Uint8Array(bytes), config);
      self.postMessage({ id, ok: true, svg });
    } else if (action === 'optimize') {
      const { text, opts } = e.data;
      self.postMessage({ id, phase: 'optimizing' });
      const optimized = await engine.optimize(text, opts);
      self.postMessage({ id, ok: true, optimized });
    } else {
      self.postMessage({ id, ok: false, error: `unknown action: ${action}` });
    }
  } catch (err) {
    self.postMessage({ id, ok: false, error: String(err?.message || err) });
  }
};
