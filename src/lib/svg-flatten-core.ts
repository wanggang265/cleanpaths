/**
 * svg-flatten-core.ts — DOM-free SVG flattening engine (07c).
 *
 * Pure-math re-implementation of the old main-thread flattenSvg
 * (src/lib/svg-flatten.ts @ 42881d3) so the whole flatten step can run
 * inside a Web Worker:
 *   - SVG document parsed with a minimal built-in XML parser (no DOMParser
 *     in workers)
 *   - path geometry via svg-path-properties (MIT, no DOM dependency)
 *     instead of SVGPathElement.getPointAtLength
 *   - transforms baked in with a hand-computed CTM stack (replaces getCTM;
 *     matches getCTM semantics: element/ancestor `transform` attributes
 *     only, root viewBox mapping NOT included — verified vs Chrome)
 *
 * Fidelity strategy is the #19a curvature-adaptive sampling, with the
 * sharp-corner miss fixed: the old single-midpoint probe missed symmetric
 * spikes (midpoint lands on the chord). Each span is now probed at 1/4,
 * 1/2 and 3/4 and split at the WORST probe point, so corners are isolated
 * directly. Same budget constants as 07b (seed 256, chordTol 0.25,
 * minSpan 0.12, hard cap 4000) so straight runs stay sparse.
 *
 * Runs in worker and (for tests) in Node — zero browser APIs.
 */
import { svgPathProperties } from 'svg-path-properties';
import type { Pt, TraceLayer } from './dxf';

/* ------------------------------------------------------------------ *
 * minimal XML parser (elements + attributes only; text nodes ignored) *
 * ------------------------------------------------------------------ */

export interface XmlEl {
  tag: string; // local name, namespace prefix stripped, lowercased
  attrs: Record<string, string>;
  children: XmlEl[];
}

function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

/** Parse an SVG document into an element tree. Tolerant: never throws on
 *  malformed input, returns null only when no root element exists. */
export function parseSvgXml(src: string): XmlEl | null {
  let i = 0;
  const n = src.length;
  const root: XmlEl = { tag: '#root', attrs: {}, children: [] };
  const stack: XmlEl[] = [root];

  while (i < n) {
    const lt = src.indexOf('<', i);
    if (lt === -1) break;
    if (src.startsWith('<!--', lt)) {
      const end = src.indexOf('-->', lt + 4);
      i = end === -1 ? n : end + 3;
      continue;
    }
    if (src.startsWith('<![CDATA[', lt)) {
      const end = src.indexOf(']]>', lt + 9);
      i = end === -1 ? n : end + 3;
      continue;
    }
    if (src.startsWith('<?', lt)) {
      const end = src.indexOf('?>', lt + 2);
      i = end === -1 ? n : end + 2;
      continue;
    }
    if (src.startsWith('<!', lt)) {
      // DOCTYPE etc. — skip to '>' (internal subsets with '>' are rare and
      // irrelevant here: we only need shape elements)
      const end = src.indexOf('>', lt + 2);
      i = end === -1 ? n : end + 1;
      continue;
    }
    if (src.startsWith('</', lt)) {
      const end = src.indexOf('>', lt + 2);
      const name = src
        .slice(lt + 2, end === -1 ? n : end)
        .trim()
        .toLowerCase()
        .split(':')
        .pop()!;
      // pop to matching open tag (tolerant of mis-nesting)
      for (let k = stack.length - 1; k >= 1; k--) {
        if (stack[k].tag === name) {
          stack.length = k;
          break;
        }
      }
      i = end === -1 ? n : end + 1;
      continue;
    }
    // open tag
    let j = lt + 1;
    let name = '';
    while (j < n && !/[\s/>]/.test(src[j])) name += src[j++];
    const attrs: Record<string, string> = {};
    let selfClose = false;
    while (j < n) {
      while (j < n && /\s/.test(src[j])) j++;
      if (src[j] === '>') { j++; break; }
      if (src[j] === '/' && src[j + 1] === '>') { selfClose = true; j += 2; break; }
      if (j >= n) break;
      let aname = '';
      while (j < n && !/[\s=/>]/.test(src[j])) aname += src[j++];
      if (!aname) { j++; continue; } // stray char (e.g. bare '/') — always advance
      while (j < n && /\s/.test(src[j])) j++;
      let aval = '';
      if (src[j] === '=') {
        j++;
        while (j < n && /\s/.test(src[j])) j++;
        const q = src[j];
        if (q === '"' || q === "'") {
          const end = src.indexOf(q, j + 1);
          aval = src.slice(j + 1, end === -1 ? n : end);
          j = end === -1 ? n : end + 1;
        } else {
          const start = j;
          while (j < n && !/[\s>]/.test(src[j])) j++;
          aval = src.slice(start, j);
        }
      }
      if (aname) attrs[aname.toLowerCase()] = decodeEntities(aval);
    }
    const el: XmlEl = {
      tag: name.toLowerCase().split(':').pop()!,
      attrs,
      children: [],
    };
    stack[stack.length - 1].children.push(el);
    if (!selfClose) stack.push(el);
    i = j;
  }
  return root.children.find((c) => c.tag === 'svg') ?? root.children[0] ?? null;
}

/* ----------------------------- colors ----------------------------- */

/**
 * CSS Color Level 4 named colors — complete 148-entry table (gray/grey
 * double spellings included). Hand-written SVGs and web icons use
 * unpredictable keywords, so the full table is required (QA v2 §3).
 * `currentcolor` falls back to black per browser convention for standalone
 * SVG files with no CSS context.
 */
const NAMED_COLORS: Record<string, string> = {
  aliceblue: 'f0f8ff', antiquewhite: 'faebd7', aqua: '00ffff', aquamarine: '7fffd4',
  azure: 'f0ffff', beige: 'f5f5dc', bisque: 'ffe4c4', black: '000000',
  blanchedalmond: 'ffebcd', blue: '0000ff', blueviolet: '8a2be2', brown: 'a52a2a',
  burlywood: 'deb887', cadetblue: '5f9ea0', chartreuse: '7fff00', chocolate: 'd2691e',
  coral: 'ff7f50', cornflowerblue: '6495ed', cornsilk: 'fff8dc', crimson: 'dc143c',
  cyan: '00ffff', darkblue: '00008b', darkcyan: '008b8b', darkgoldenrod: 'b8860b',
  darkgray: 'a9a9a9', darkgrey: 'a9a9a9', darkgreen: '006400', darkkhaki: 'bdb76b',
  darkmagenta: '8b008b', darkolivegreen: '556b2f', darkorange: 'ff8c00', darkorchid: '9932cc',
  darkred: '8b0000', darksalmon: 'e9967a', darkseagreen: '8fbc8f', darkslateblue: '483d8b',
  darkslategray: '2f4f4f', darkslategrey: '2f4f4f', darkturquoise: '00ced1', darkviolet: '9400d3',
  deeppink: 'ff1493', deepskyblue: '00bfff', dimgray: '696969', dimgrey: '696969',
  dodgerblue: '1e90ff', firebrick: 'b22222', floralwhite: 'fffaf0', forestgreen: '228b22',
  fuchsia: 'ff00ff', gainsboro: 'dcdcdc', ghostwhite: 'f8f8ff', gold: 'ffd700',
  goldenrod: 'daa520', gray: '808080', grey: '808080', green: '008000',
  greenyellow: 'adff2f', honeydew: 'f0fff0', hotpink: 'ff69b4', indianred: 'cd5c5c',
  indigo: '4b0082', ivory: 'fffff0', khaki: 'f0e68c', lavender: 'e6e6fa',
  lavenderblush: 'fff0f5', lawngreen: '7cfc00', lemonchiffon: 'fffacd', lightblue: 'add8e6',
  lightcoral: 'f08080', lightcyan: 'e0ffff', lightgoldenrodyellow: 'fafad2', lightgray: 'd3d3d3',
  lightgrey: 'd3d3d3', lightgreen: '90ee90', lightpink: 'ffb6c1', lightsalmon: 'ffa07a',
  lightseagreen: '20b2aa', lightskyblue: '87cefa', lightslategray: '778899', lightslategrey: '778899',
  lightsteelblue: 'b0c4de', lightyellow: 'ffffe0', lime: '00ff00', limegreen: '32cd32',
  linen: 'faf0e6', magenta: 'ff00ff', maroon: '800000', mediumaquamarine: '66cdaa',
  mediumblue: '0000cd', mediumorchid: 'ba55d3', mediumpurple: '9370db', mediumseagreen: '3cb371',
  mediumslateblue: '7b68ee', mediumspringgreen: '00fa9a', mediumturquoise: '48d1cc',
  mediumvioletred: 'c71585', midnightblue: '191970', mintcream: 'f5fffa', mistyrose: 'ffe4e1',
  moccasin: 'ffe4b5', navajowhite: 'ffdead', navy: '000080', oldlace: 'fdf5e6',
  olive: '808000', olivedrab: '6b8e23', orange: 'ffa500', orangered: 'ff4500',
  orchid: 'da70d6', palegoldenrod: 'eee8aa', palegreen: '98fb98', paleturquoise: 'afeeee',
  palevioletred: 'db7093', papayawhip: 'ffefd5', peachpuff: 'ffdab9', peru: 'cd853f',
  pink: 'ffc0cb', plum: 'dda0dd', powderblue: 'b0e0e6', purple: '800080',
  rebeccapurple: '663399', red: 'ff0000', rosybrown: 'bc8f8f', royalblue: '4169e1',
  saddlebrown: '8b4513', salmon: 'fa8072', sandybrown: 'f4a460', seagreen: '2e8b57',
  seashell: 'fff5ee', sienna: 'a0522d', silver: 'c0c0c0', skyblue: '87ceeb',
  slateblue: '6a5acd', slategray: '708090', slategrey: '708090', snow: 'fffafa',
  springgreen: '00ff7f', steelblue: '4682b4', tan: 'd2b48c', teal: '008080',
  thistle: 'd8bfd8', tomato: 'ff6347', turquoise: '40e0d0', violet: 'ee82ee',
  wheat: 'f5deb3', white: 'ffffff', whitesmoke: 'f5f5f5', yellow: 'ffff00',
  yellowgreen: '9acd32',
};

function rgbToHex(color: string): string | null {
  const c = color.trim().toLowerCase();
  if (!c || c === 'none' || c === 'transparent') return null;
  if (c === 'currentcolor') return '000000'; // standalone SVG: no CSS context
  const named = NAMED_COLORS[c];
  if (named) return named;
  const m = c.match(/rgba?\(([^)]+)\)/i);
  if (!m) {
    if (/^#[0-9a-f]{6}$/i.test(c)) return c.slice(1).toLowerCase();
    if (/^#[0-9a-f]{3}$/i.test(c))
      return c.slice(1).split('').map((ch) => ch + ch).join('').toLowerCase();
    return null;
  }
  const parts = m[1].split(',').map((s) => parseFloat(s));
  if (parts.length >= 4 && parts[3] === 0) return null; // fully transparent
  const [r, g, b] = parts;
  const h = (x: number) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0');
  return `${h(r)}${h(g)}${h(b)}`;
}

/** Nearly-white layers are background fills from the tracer — drop them. */
function isBackground(hex: string): boolean {
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return r > 242 && g > 242 && b > 242;
}

/* ---------------------------- matrices ---------------------------- */

interface Mat {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
}
const IDENTITY: Mat = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };

/** m1 × m2 (m2 applied first, column-vector convention) */
function mulMat(m1: Mat, m2: Mat): Mat {
  return {
    a: m1.a * m2.a + m1.c * m2.b,
    b: m1.b * m2.a + m1.d * m2.b,
    c: m1.a * m2.c + m1.c * m2.d,
    d: m1.b * m2.c + m1.d * m2.d,
    e: m1.a * m2.e + m1.c * m2.f + m1.e,
    f: m1.b * m2.e + m1.d * m2.f + m1.f,
  };
}

function applyMat(p: { x: number; y: number }, m: Mat): Pt {
  return { x: m.a * p.x + m.c * p.y + m.e, y: m.b * p.x + m.d * p.y + m.f };
}

const DEG = Math.PI / 180;

/** Parse an SVG `transform` attribute value into a matrix. */
export function parseTransform(s: string): Mat {
  let acc: Mat = IDENTITY;
  const re = /(matrix|translate|scale|rotate|skewx|skewy)\s*\(([^)]*)\)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    const v = m[2]
      .trim()
      .split(/[\s,]+/)
      .map(parseFloat)
      .filter((x) => isFinite(x));
    let t: Mat = IDENTITY;
    switch (m[1].toLowerCase()) {
      case 'matrix':
        if (v.length === 6) t = { a: v[0], b: v[1], c: v[2], d: v[3], e: v[4], f: v[5] };
        break;
      case 'translate':
        t = { a: 1, b: 0, c: 0, d: 1, e: v[0] ?? 0, f: v[1] ?? 0 };
        break;
      case 'scale': {
        const sx = v[0] ?? 1;
        const sy = v.length > 1 ? v[1] : sx;
        t = { a: sx, b: 0, c: 0, d: sy, e: 0, f: 0 };
        break;
      }
      case 'rotate': {
        const cos = Math.cos((v[0] ?? 0) * DEG);
        const sin = Math.sin((v[0] ?? 0) * DEG);
        const r: Mat = { a: cos, b: sin, c: -sin, d: cos, e: 0, f: 0 };
        if (v.length >= 3) {
          const [cx, cy] = [v[1], v[2]];
          t = mulMat(mulMat({ a: 1, b: 0, c: 0, d: 1, e: cx, f: cy }, r), {
            a: 1, b: 0, c: 0, d: 1, e: -cx, f: -cy,
          });
        } else t = r;
        break;
      }
      case 'skewx':
        t = { a: 1, b: 0, c: Math.tan((v[0] ?? 0) * DEG), d: 1, e: 0, f: 0 };
        break;
      case 'skewy':
        t = { a: 1, b: 0, c: 0, d: Math.tan((v[0] ?? 0) * DEG), e: 0, f: 0 };
        break;
    }
    acc = mulMat(acc, t);
  }
  return acc;
}

/* ------------------------- adaptive sampling ----------------------- */

/** per-path point ceiling — matches the pre-regression fidelity reference */
const SAMPLE_HARD_CAP = 4000;
/** chord-deviation tolerance (SVG user units ≈ px) before a span is split */
const CHORD_TOL = 0.25;
/** arc-length floor per span — below this, remaining error is sub-pixel */
const MIN_SPAN = 0.12;
/** seed samples per path (straight paths never need more) */
const SEED_CAP = 256;

function distPtToSeg(p: { x: number; y: number }, a: { x: number; y: number }, b: { x: number; y: number }): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const l2 = dx * dx + dy * dy;
  let t = l2 === 0 ? 0 : ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

/** probe fractions per span — 07c fix: 3 probes instead of the single
 *  midpoint, so symmetric spikes/corners can no longer hide from the chord
 *  test; the span is split at the WORST probe, isolating the corner. */
const PROBES = [0.25, 0.5, 0.75];

interface PathProps {
  getTotalLength(): number;
  getPointAtLength(len: number): { x: number; y: number };
}

function samplePath(props: PathProps, ctm: Mat, step: number): Pt[][] {
  const total = props.getTotalLength();
  if (!isFinite(total) || total <= 0) return [];

  // 1) coarse uniform seed (spacing = precision step, capped)
  const n = Math.max(8, Math.min(SEED_CAP, Math.ceil(total / step)));
  let lens: number[] = [];
  let raw: Array<{ x: number; y: number }> = [];
  for (let i = 0; i <= n; i++) {
    lens.push((i / n) * total);
    raw.push(props.getPointAtLength(lens[i]));
  }

  // 2) adaptive refinement: probe each span at 1/4, 1/2, 3/4; if any probe
  //    misses the chord beyond tolerance, split at the worst probe point.
  for (let pass = 0; pass < 16; pass++) {
    const nextLens: number[] = [lens[0]];
    const nextRaw: Array<{ x: number; y: number }> = [raw[0]];
    let splits = 0;
    for (let i = 0; i < lens.length - 1; i++) {
      const span = lens[i + 1] - lens[i];
      if (span > MIN_SPAN && nextLens.length + (lens.length - i) < SAMPLE_HARD_CAP) {
        let worstLen = -1;
        let worstPt: { x: number; y: number } | null = null;
        let worstDev = CHORD_TOL;
        for (const f of PROBES) {
          const l = lens[i] + span * f;
          const p = props.getPointAtLength(l);
          const dev = distPtToSeg(p, raw[i], raw[i + 1]);
          if (dev > worstDev) {
            worstDev = dev;
            worstLen = l;
            worstPt = p;
          }
        }
        if (worstPt) {
          nextLens.push(worstLen);
          nextRaw.push(worstPt);
          splits += 1;
        }
      }
      nextLens.push(lens[i + 1]);
      nextRaw.push(raw[i + 1]);
    }
    lens = nextLens;
    raw = nextRaw;
    if (splits === 0) break;
  }

  const pts: Pt[] = raw.map((p) => applyMat(p, ctm));
  // drop duplicate closing point; DXF closed flag joins the loop
  if (pts.length > 1) {
    const a = pts[0];
    const b = pts[pts.length - 1];
    if (Math.hypot(a.x - b.x, a.y - b.y) < 1e-4) pts.pop();
  }
  return pts.length >= 2 ? [pts] : [];
}

/* ---------------------------- primitives --------------------------- */

function primitiveToPoints(el: XmlEl, ctm: Mat): Pt[][] {
  const num = (name: string, def = 0) => {
    const v = el.attrs[name];
    const x = v === undefined ? NaN : parseFloat(v);
    return isFinite(x) ? x : def;
  };
  let pts: Pt[] = [];
  if (el.tag === 'rect') {
    const x = num('x'), y = num('y'), w = num('width'), h = num('height');
    pts = [
      { x, y },
      { x: x + w, y },
      { x: x + w, y: y + h },
      { x, y: y + h },
    ];
  } else if (el.tag === 'line') {
    pts = [
      { x: num('x1'), y: num('y1') },
      { x: num('x2'), y: num('y2') },
    ];
  } else if (el.tag === 'circle' || el.tag === 'ellipse') {
    const cx = num('cx'), cy = num('cy');
    const rx = el.tag === 'circle' ? num('r') : num('rx');
    const ry = el.tag === 'circle' ? num('r') : num('ry');
    const seg = Math.max(24, Math.min(128, Math.ceil((Math.max(rx, ry) * Math.PI * 2) / 1.5)));
    for (let i = 0; i < seg; i++) {
      const t = (i / seg) * Math.PI * 2;
      pts.push({ x: cx + rx * Math.cos(t), y: cy + ry * Math.sin(t) });
    }
  } else if (el.tag === 'polyline' || el.tag === 'polygon') {
    const rawPts = (el.attrs['points'] || '').trim();
    const nums = rawPts.split(/[\s,]+/).map(parseFloat).filter(isFinite);
    for (let i = 0; i + 1 < nums.length; i += 2) pts.push({ x: nums[i], y: nums[i + 1] });
  } else {
    return [];
  }
  if (pts.length < 2) return [];
  return [pts.map((p) => applyMat(p, ctm))];
}

/* ----------------------------- driver ------------------------------ */

const SHAPE_TAGS = new Set(['path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon']);

/** fill/stroke from presentation attribute first, inline style second —
 *  same precedence as the old DOM version (getAttribute || el.style). */
function paintOf(el: XmlEl): { fill: string | null; stroke: string | null } {
  let styleFill = '';
  let styleStroke = '';
  const style = el.attrs['style'];
  if (style) {
    for (const decl of style.split(';')) {
      const ci = decl.indexOf(':');
      if (ci === -1) continue;
      const k = decl.slice(0, ci).trim().toLowerCase();
      const v = decl.slice(ci + 1).trim();
      if (k === 'fill') styleFill = v;
      else if (k === 'stroke') styleStroke = v;
    }
  }
  return {
    fill: rgbToHex(el.attrs['fill'] || styleFill || ''),
    stroke: rgbToHex(el.attrs['stroke'] || styleStroke || ''),
  };
}

export interface FlattenCoreOptions {
  /** sampling step in px for curves (precision slider feeds this) */
  step?: number;
  /** drop near-white background layers (tracer output) */
  dropBackground?: boolean;
  /** progress callback: (doneElements, totalElements) */
  onProgress?: (done: number, total: number) => void;
}

/**
 * Flatten an SVG string into color-separated closed loops.
 * DOM-free: safe to run inside a Web Worker (or Node for tests).
 */
export function flattenSvgCore(svgText: string, opts: FlattenCoreOptions = {}): TraceLayer[] {
  const step = opts.step ?? 0.8;
  const srcSvg = parseSvgXml(svgText);
  if (!srcSvg || srcSvg.tag !== 'svg') throw new Error('not an SVG document');

  // collect shape elements with their CTM (document order, like querySelectorAll)
  const found: Array<{ el: XmlEl; ctm: Mat }> = [];
  const walk = (el: XmlEl, parent: Mat) => {
    const local = el.attrs['transform'] ? parseTransform(el.attrs['transform']) : null;
    const ctm = local ? mulMat(parent, local) : parent;
    if (SHAPE_TAGS.has(el.tag)) found.push({ el, ctm });
    for (const c of el.children) walk(c, ctm);
  };
  walk(srcSvg, IDENTITY);

  const byColor = new Map<string, Pt[][]>();
  const total = found.length;
  for (let i = 0; i < total; i++) {
    const { el, ctm } = found[i];
    const { fill, stroke } = paintOf(el);
    const hex = fill ?? stroke;
    if (!hex) continue;
    if (opts.dropBackground !== false && fill && isBackground(fill)) continue;
    let loops: Pt[][] = [];
    if (el.tag === 'path') {
      const d = el.attrs['d'];
      if (d) {
        try {
          loops = samplePath(new svgPathProperties(d) as PathProps, ctm, step);
        } catch {
          loops = []; // malformed path data — skip, same spirit as old code
        }
      }
    } else {
      loops = primitiveToPoints(el, ctm);
    }
    if (loops.length === 0) continue;
    const arr = byColor.get(hex) ?? [];
    arr.push(...loops);
    byColor.set(hex, arr);
    if (opts.onProgress && (i & 15) === 0) opts.onProgress(i + 1, total);
  }
  if (opts.onProgress) opts.onProgress(total, total);

  return Array.from(byColor.entries()).map(([hex, paths]) => ({ hex, paths }));
}
