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

function loadEngine(id) {
  if (!enginePromise) {
    // 07d: real phase event — first-run WASM fetch+compile is seconds-long
    self.postMessage({ id, phase: 'engine-loading' });
    enginePromise = import('./vectorizer.bundle.js');
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
