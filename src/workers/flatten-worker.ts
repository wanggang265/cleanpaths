/**
 * flatten-worker.ts — Web Worker entry for the 07c DOM-free flatten engine.
 * Bundled by esbuild to public/vendor/flatten/flatten-worker.js
 * (see package.json "build:flatten"). Classic worker, single-file bundle.
 *
 * Message protocol:
 *   → { id, action: 'flatten', text: string, opts: { step?, dropBackground? } }
 *   ← { id, progress: number }              (0..1, throttled)
 *   ← { id, ok: true, meta, coords }        (coords: Float32Array, transferred)
 *   ← { id, ok: false, error: string }
 *
 * The result is sent as a transferable flat coordinate buffer plus small
 * metadata so the main thread pays ZERO structured-clone cost for the
 * (potentially million-point) payload — it rebuilds Pt objects lazily in
 * yielded chunks (see flatten-client.ts).
 */
import { flattenSvgCore } from '../lib/svg-flatten-core';

interface FlattenRequest {
  id: number;
  action: string;
  text: string;
  opts?: { step?: number; dropBackground?: boolean };
}

interface LayerMeta {
  hex: string;
  /** [offsetIntoCoords, pointCount] per path */
  spans: Array<[number, number]>;
}

const ctx = self as unknown as {
  onmessage: ((e: MessageEvent<FlattenRequest>) => void) | null;
  postMessage: (msg: unknown, transfer?: Transferable[]) => void;
};

ctx.onmessage = (e) => {
  const { id, action, text, opts } = e.data;
  if (action !== 'flatten') {
    ctx.postMessage({ id, ok: false, error: `unknown action: ${action}` });
    return;
  }
  try {
    let lastPost = 0;
    const layers = flattenSvgCore(text, {
      step: opts?.step,
      dropBackground: opts?.dropBackground,
      onProgress: (done, total) => {
        const now = Date.now();
        if (now - lastPost > 120 || done === total) {
          lastPost = now;
          ctx.postMessage({ id, progress: total === 0 ? 1 : done / total });
        }
      },
    });

    // encode to transferable flat buffer
    let totalPts = 0;
    for (const l of layers) for (const p of l.paths) totalPts += p.length;
    const coords = new Float32Array(totalPts * 2);
    const meta: LayerMeta[] = [];
    let off = 0;
    for (const l of layers) {
      const spans: Array<[number, number]> = [];
      for (const p of l.paths) {
        spans.push([off, p.length]);
        for (let k = 0; k < p.length; k++) {
          coords[off * 2 + k * 2] = p[k].x;
          coords[off * 2 + k * 2 + 1] = p[k].y;
        }
        off += p.length;
      }
      meta.push({ hex: l.hex, spans });
    }
    ctx.postMessage({ id, ok: true, meta, coords }, [coords.buffer]);
  } catch (err) {
    ctx.postMessage({ id, ok: false, error: String((err as Error)?.message || err) });
  }
};
