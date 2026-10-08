/**
 * svg-flatten.ts — SVG preview builder.
 *
 * 07c: the DOM-based flattenSvg lived here and ran on the main thread using
 * getPointAtLength probes; its cost exploded with path complexity (#18 big
 * files >200s, p95 tick 1200ms) and its single-midpoint probe missed sharp
 * corners (#19a maxDev 0.82mm > 0.5mm line). The whole flatten step moved
 * into the flatten Web Worker — pure-math engine in svg-flatten-core.ts,
 * RPC client in flatten-client.ts (flattenSvgAsync). Only the pure preview
 * builder below remains on the main thread.
 */
import type { TraceLayer } from './dxf';

const SVG_NS = 'http://www.w3.org/2000/svg';

/** Build a standalone SVG preview string from flattened layers (for OUTPUT PREVIEW). */
export function layersToSvg(layers: TraceLayer[], width: number, height: number): string {
  const paths = layers
    .map((l) =>
      l.paths
        .map((p) => {
          const d = p.map((pt, i) => `${i === 0 ? 'M' : 'L'}${pt.x.toFixed(2)},${pt.y.toFixed(2)}`).join('') + 'Z';
          return `<path d=\"${d}\" fill=\"#${l.hex}\"/>`;
        })
        .join(''),
    )
    .join('');
  return `<svg xmlns=\"${SVG_NS}\" width=\"${width}\" height=\"${height}\" viewBox=\"0 0 ${width} ${height}\">${paths}</svg>`;
}
