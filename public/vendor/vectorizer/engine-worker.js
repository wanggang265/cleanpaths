/**
 * engine-worker.js — Web Worker wrapper around the vendored vectorizer bundle.
 * Loads the WASM engine inside the worker (main thread stays responsive),
 * exposes vectorize + optimize via postMessage RPC.
 *
 * Message protocol:
 *   → { id, action: 'vectorize', bytes: ArrayBuffer, config: object }
 *   ← { id, ok: true, svg: string } | { id, ok: false, error: string }
 *   → { id, action: 'optimize', text: string, opts: object }
 *   ← { id, ok: true, optimized: string } | { id, ok: false, error: string }
 */

let enginePromise = null;

function loadEngine() {
  if (!enginePromise) {
    enginePromise = import('./vectorizer.bundle.js');
  }
  return enginePromise;
}

self.onmessage = async (e) => {
  const { id, action } = e.data;
  try {
    const engine = await loadEngine();
    if (action === 'vectorize') {
      const { bytes, config } = e.data;
      const svg = await engine.vectorize(new Uint8Array(bytes), config);
      self.postMessage({ id, ok: true, svg });
    } else if (action === 'optimize') {
      const { text, opts } = e.data;
      const optimized = await engine.optimize(text, opts);
      self.postMessage({ id, ok: true, optimized });
    } else {
      self.postMessage({ id, ok: false, error: `unknown action: ${action}` });
    }
  } catch (err) {
    self.postMessage({ id, ok: false, error: String(err?.message || err) });
  }
};
