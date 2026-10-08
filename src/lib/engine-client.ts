/**
 * engine-client.ts — main-thread RPC client for the vectorizer engine worker.
 * Replaces direct bundle imports: engine.vectorize / engine.optimize now run
 * inside a Web Worker, keeping the main thread responsive during trace.
 */

interface WorkerResponse {
  id: number;
  ok?: boolean;
  /** 07d: informational stage event — never a completion signal */
  phase?: string;
  svg?: string;
  optimized?: string;
  error?: string;
}

let worker: Worker | null = null;
let nextId = 0;
const pending = new Map<
  number,
  { resolve: (v: string) => void; reject: (e: Error) => void; onPhase?: (phase: string) => void }
>();

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker('/vendor/vectorizer/engine-worker.js', { type: 'module' });
    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const { id, ok, phase, svg, optimized, error } = e.data;
      const entry = pending.get(id);
      if (!entry) return;
      if (typeof phase === 'string' && ok === undefined) {
        entry.onPhase?.(phase);
        return;
      }
      pending.delete(id);
      if (ok) entry.resolve(svg ?? optimized ?? '');
      else entry.reject(new Error(error ?? 'engine worker error'));
    };
    worker.onerror = (e) => {
      const err = new Error(`engine worker crashed: ${e.message}`);
      pending.forEach((entry) => entry.reject(err));
      pending.clear();
    };
  }
  return worker;
}

function call(
  action: 'vectorize' | 'optimize',
  payload: Record<string, unknown>,
  onPhase?: (phase: string) => void,
): Promise<string> {
  const w = getWorker();
  const id = ++nextId;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject, onPhase });
    w.postMessage({ id, action, ...payload });
  });
}

/** Vectorize raster bytes to SVG (runs in worker). */
export async function vectorize(
  bytes: Uint8Array,
  config: Record<string, unknown>,
  onPhase?: (phase: string) => void,
): Promise<string> {
  // Transfer the underlying buffer to avoid a copy; caller must not reuse `bytes`.
  const buf = bytes.buffer.slice(0);
  return call('vectorize', { bytes: buf, config }, onPhase);
}

/** Optimize an existing SVG string (runs in worker). */
export async function optimize(text: string, opts: Record<string, unknown>): Promise<string> {
  return call('optimize', { text, opts });
}
