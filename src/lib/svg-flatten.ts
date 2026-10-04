/**
 * svg-flatten.ts — parse an SVG document into color-separated closed polyline
 * loops (SVG coordinate space, px). Curves are sampled to polylines (this is
 * the "Converting curves to polylines" step); transforms are baked in via
 * getCTM. Used by both the SVG→DXF tool and the raster→DXF pipeline (which
 * flattens the tracer's SVG output the same way).
 */
import type { Pt, TraceLayer } from './dxf';

const SVG_NS = 'http://www.w3.org/2000/svg';

function rgbToHex(color: string): string | null {
  const m = color.match(/rgba?\(([^)]+)\)/i);
  if (!m) {
    if (/^#[0-9a-f]{6}$/i.test(color)) return color.slice(1).toLowerCase();
    if (/^#[0-9a-f]{3}$/i.test(color))
      return color.slice(1).split('').map((c) => c + c).join('').toLowerCase();
    return null;
  }
  const parts = m[1].split(',').map((s) => parseFloat(s));
  if (parts.length >= 4 && parts[3] === 0) return null; // fully transparent
  const [r, g, b] = parts;
  const h = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `${h(r)}${h(g)}${h(b)}`;
}

/** Nearly-white layers are background fills from the tracer — drop them. */
function isBackground(hex: string): boolean {
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return r > 242 && g > 242 && b > 242;
}

function samplePath(el: SVGPathElement, ctm: DOMMatrix | null, step: number): Pt[][] {
  const total = el.getTotalLength();
  if (!isFinite(total) || total <= 0) return [];
  const n = Math.max(8, Math.min(4000, Math.ceil(total / step)));
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const p = el.getPointAtLength((i / n) * total);
    pts.push(ctm ? applyMatrix(p, ctm) : { x: p.x, y: p.y });
  }
  // drop duplicate closing point; DXF closed flag joins the loop
  if (pts.length > 1) {
    const a = pts[0];
    const b = pts[pts.length - 1];
    if (Math.hypot(a.x - b.x, a.y - b.y) < 1e-4) pts.pop();
  }
  return pts.length >= 2 ? [pts] : [];
}

function applyMatrix(p: { x: number; y: number }, m: DOMMatrix): Pt {
  return { x: m.a * p.x + m.c * p.y + m.e, y: m.b * p.x + m.d * p.y + m.f };
}

function primitiveToPoints(el: Element, ctm: DOMMatrix | null): Pt[][] {
  const tag = el.tagName.toLowerCase();
  const num = (name: string, def = 0) => {
    const v = el.getAttribute(name);
    const n = v === null ? NaN : parseFloat(v);
    return isFinite(n) ? n : def;
  };
  let pts: Pt[] = [];
  if (tag === 'rect') {
    const x = num('x'), y = num('y'), w = num('width'), h = num('height');
    pts = [
      { x, y },
      { x: x + w, y },
      { x: x + w, y: y + h },
      { x, y: y + h },
    ];
  } else if (tag === 'line') {
    pts = [
      { x: num('x1'), y: num('y1') },
      { x: num('x2'), y: num('y2') },
    ];
  } else if (tag === 'circle' || tag === 'ellipse') {
    const cx = num('cx'), cy = num('cy');
    const rx = tag === 'circle' ? num('r') : num('rx');
    const ry = tag === 'circle' ? num('r') : num('ry');
    const seg = Math.max(24, Math.min(128, Math.ceil((Math.max(rx, ry) * Math.PI * 2) / 1.5)));
    for (let i = 0; i < seg; i++) {
      const t = (i / seg) * Math.PI * 2;
      pts.push({ x: cx + rx * Math.cos(t), y: cy + ry * Math.sin(t) });
    }
  } else if (tag === 'polyline' || tag === 'polygon') {
    const raw = (el.getAttribute('points') || '').trim();
    const nums = raw.split(/[\s,]+/).map(parseFloat).filter(isFinite);
    for (let i = 0; i + 1 < nums.length; i += 2) pts.push({ x: nums[i], y: nums[i + 1] });
  } else {
    return [];
  }
  if (pts.length < 2) return [];
  return [ctm ? pts.map((p) => applyMatrix(p, ctm)) : pts];
}

export interface FlattenOptions {
  /** sampling step in px for curves (precision slider feeds this) */
  step?: number;
  /** drop near-white background layers (tracer output) */
  dropBackground?: boolean;
}

/**
 * Flatten an SVG string into color-separated closed loops.
 * Must run in a browser document (uses DOM rendering for geometry APIs).
 */
export function flattenSvg(svgText: string, opts: FlattenOptions = {}): TraceLayer[] {
  const step = opts.step ?? 0.8;
  const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml');
  const srcSvg = doc.documentElement;
  if (!srcSvg || srcSvg.tagName.toLowerCase() !== 'svg') throw new Error('not an SVG document');

  // Mount into a hidden live SVG so geometry APIs (getCTM/getPointAtLength) work.
  const host = document.createElement('div');
  host.style.cssText = 'position:absolute;left:-10000px;top:0;width:1px;height:1px;overflow:hidden;visibility:hidden';
  const liveSvg = document.createElementNS(SVG_NS, 'svg');
  liveSvg.setAttribute('width', srcSvg.getAttribute('width') || '300');
  liveSvg.setAttribute('height', srcSvg.getAttribute('height') || '150');
  if (srcSvg.getAttribute('viewBox')) liveSvg.setAttribute('viewBox', srcSvg.getAttribute('viewBox')!);
  host.appendChild(liveSvg);
  document.body.appendChild(host);
  liveSvg.innerHTML = srcSvg.innerHTML;

  const byColor = new Map<string, Pt[][]>();
  try {
    const shapes = liveSvg.querySelectorAll('path, rect, circle, ellipse, line, polyline, polygon');
    for (const el of Array.from(shapes)) {
      const g = el as SVGGraphicsElement;
      const cs = getComputedStyle(g);
      const fill = rgbToHex(cs.fill || '');
      const stroke = rgbToHex(cs.stroke || '');
      const hex = fill ?? stroke;
      if (!hex) continue;
      if (opts.dropBackground !== false && fill && isBackground(fill)) continue;
      let ctm: DOMMatrix | null = null;
      try {
        ctm = g.getCTM();
      } catch {
        ctm = null;
      }
      const loops =
        el.tagName.toLowerCase() === 'path'
          ? samplePath(el as SVGPathElement, ctm, step)
          : primitiveToPoints(el, ctm);
      if (loops.length === 0) continue;
      const arr = byColor.get(hex) ?? [];
      arr.push(...loops);
      byColor.set(hex, arr);
    }
  } finally {
    host.remove();
  }

  return Array.from(byColor.entries()).map(([hex, paths]) => ({ hex, paths }));
}

/** Build a standalone SVG preview string from flattened layers (for OUTPUT PREVIEW). */
export function layersToSvg(layers: TraceLayer[], width: number, height: number): string {
  const paths = layers
    .map((l) =>
      l.paths
        .map((p) => {
          const d = p.map((pt, i) => `${i === 0 ? 'M' : 'L'}${pt.x.toFixed(2)},${pt.y.toFixed(2)}`).join('') + 'Z';
          return `<path d="${d}" fill="#${l.hex}"/>`;
        })
        .join(''),
    )
    .join('');
  return `<svg xmlns="${SVG_NS}" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${paths}</svg>`;
}
