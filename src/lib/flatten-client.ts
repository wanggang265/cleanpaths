/**
 * flatten-client.ts — main-thread RPC client for the flatten worker (07c).
 * flattenSvg used to run on the main thread with DOM geometry APIs
 * (getPointAtLength probes) — cost exploded with path complexity and froze
 * interaction (#18/#19a, p95 tick 1200ms). Now the whole flatten runs in
 * /vendor/flatten/flatten-worker.js; the main thread only receives progress
 * events and the final transferable coordinate buffer, which is rebuilt
 * into TraceLayer objects in yielded chunks so no single task blows the
 * 500ms tick budget.
 */
import type { Pt, TraceLayer } from './dxf';

interface LayerMeta {
  hex: string;
  spans: Array<[number, number]>;
}

interface WorkerResponse {
  id: number;
  ok?: boolean;
  progress?: number;
  meta?: LayerMeta[];
  coords?: Float32Array;
  error?: string;
}

interface Pending {
  resolve: (v: { meta: LayerMeta[]; coords: Float32Array }) => void;
  reject: (e: Error) => void;
  onProgress?: (frac: number) => void;
}

let worker: Worker | null = null;
let nextId = 0;
const pending = new Map<number, Pending>();

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker('/vendor/flatten/flatten-worker.js');
    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const { id, ok, progress, meta, coords, error } = e.data;
      const entry = pending.get(id);
      if (!entry) return;
      if (typeof progress === 'number' && ok === undefined) {
        entry.onProgress?.(progress);
        return;
      }
      pending.delete(id);
      if (ok && meta && coords) entry.resolve({ meta, coords });
      else entry.reject(new Error(error ?? 'flatten worker error'));
    };
    worker.onerror = (e) => {
      const err = new Error(`flatten worker crashed: ${e.message}`);
      pending.forEach((entry) => entry.reject(err));
      pending.clear();
    };
  }
  return worker;
}

const yieldToMain = () => new Promise((r) => setTimeout(r, 0));

/** Rebuild Pt loops from the flat buffer in chunks — keeps long tasks
 *  well under the interaction budget even for ~1M-point results. */
async function rebuildLayers(meta: LayerMeta[], coords: Float32Array): Promise<TraceLayer[]> {
  const layers: TraceLayer[] = [];
  let sinceYield = 0;
  for (const l of meta) {
    const paths: Pt[][] = [];
    for (const [off, count] of l.spans) {
      const pts = new Array<Pt>(count);
      for (let k = 0; k < count; k++) {
        pts[k] = { x: coords[off * 2 + k * 2], y: coords[off * 2 + k * 2 + 1] };
      }
      paths.push(pts);
      sinceYield += count;
      if (sinceYield >= 120000) {
        sinceYield = 0;
        await yieldToMain();
      }
    }
    layers.push({ hex: l.hex, paths });
  }
  return layers;
}

export interface FlattenAsyncOptions {
  /** sampling step in px for curves (precision slider feeds this) */
  step?: number;
  /** drop near-white background layers (tracer output) */
  dropBackground?: boolean;
  /** 0..1 progress from the worker (UI display only) */
  onProgress?: (frac: number) => void;
}

/**
 * Flatten an SVG string into color-separated closed loops — computed
 * entirely inside the flatten worker. Drop-in async replacement for the
 * old DOM-based flattenSvg.
 */
export async function flattenSvgAsync(svgText: string, opts: FlattenAsyncOptions = {}): Promise<TraceLayer[]> {
  const w = getWorker();
  const id = ++nextId;
  const result = await new Promise<{ meta: LayerMeta[]; coords: Float32Array }>((resolve, reject) => {
    pending.set(id, { resolve, reject, onProgress: opts.onProgress });
    w.postMessage({
      id,
      action: 'flatten',
      text: svgText,
      opts: { step: opts.step, dropBackground: opts.dropBackground },
    });
  });
  return rebuildLayers(result.meta, result.coords);
}
