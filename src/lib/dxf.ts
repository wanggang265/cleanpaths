/**
 * dxf.ts — minimal, audit-clean DXF writer.
 * R2000 (AC1015): LWPOLYLINE entities + $INSUNITS=4 (mm) + layer true colors.
 * R12  (AC1009):  POLYLINE/VERTEX/SEQEND entities (maximum compatibility mode).
 * All output is polylines — zero SPLINE entities (route promise).
 * Layers are color-separated: CP-<hex>, ordered by descending path area.
 */

export interface Pt {
  x: number;
  y: number;
}

export interface TraceLayer {
  /** 6-char hex, no '#'. */
  hex: string;
  /** Closed point loops (SVG coordinate space, y-down, px). */
  paths: Pt[][];
}

export const PX_TO_MM = 25.4 / 96;

/** Remove consecutive duplicates and near-collinear points to keep vertex counts sane. */
function simplify(points: Pt[], tolerance = 0.05): Pt[] {
  if (points.length <= 3) return points;
  const dedup: Pt[] = [];
  for (const p of points) {
    const last = dedup[dedup.length - 1];
    if (!last || Math.hypot(p.x - last.x, p.y - last.y) > 1e-6) dedup.push(p);
  }
  if (dedup.length <= 3) return dedup;
  const out: Pt[] = [dedup[0]];
  for (let i = 1; i < dedup.length - 1; i++) {
    const a = out[out.length - 1];
    const b = dedup[i];
    const c = dedup[i + 1];
    // perpendicular distance of b from a→c
    const dx = c.x - a.x;
    const dy = c.y - a.y;
    const len = Math.hypot(dx, dy);
    const dist = len === 0 ? Math.hypot(b.x - a.x, b.y - a.y) : Math.abs(dy * b.x - dx * b.y + c.x * a.y - c.y * a.x) / len;
    if (dist > tolerance) out.push(b);
  }
  out.push(dedup[dedup.length - 1]);
  return out;
}

function polygonArea(points: Pt[]): number {
  let a = 0;
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const q = points[(i + 1) % points.length];
    a += p.x * q.y - q.x * p.y;
  }
  return Math.abs(a) / 2;
}

/**
 * Bounding-box dimensions of the actual geometry (px, SVG space) — NOT the
 * canvas size. #82 mm-width semantics: "Width (mm)" is the width of the shape
 * you cut, so DXF scale = targetMm / geoWidth (artwork rarely fills the whole
 * traced canvas; scaling by canvas width would undersize the cut geometry).
 */
export function geoDims(layers: Array<{ paths: Pt[][] }>): { w: number; h: number } {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const l of layers)
    for (const p of l.paths)
      for (const pt of p) {
        if (pt.x < minX) minX = pt.x;
        if (pt.y < minY) minY = pt.y;
        if (pt.x > maxX) maxX = pt.x;
        if (pt.y > maxY) maxY = pt.y;
      }
  if (!isFinite(minX) || maxX <= minX || maxY <= minY) return { w: 0, h: 0 };
  return { w: maxX - minX, h: maxY - minY };
}

/** Sort layers by total area desc and compute per-layer simplified paths. */
export function prepareLayers(layers: TraceLayer[]): Array<{ hex: string; name: string; paths: Pt[][] }> {
  return layers
    .map((l) => ({ hex: l.hex, paths: l.paths.map((p) => simplify(p)).filter((p) => p.length >= 2) }))
    .filter((l) => l.paths.length > 0)
    .sort((a, b) => area(b) - area(a))
    .map((l, i) => ({ hex: l.hex, name: `CP-${l.hex.toUpperCase()}`, paths: l.paths }));

  function area(l: { paths: Pt[][] }): number {
    return l.paths.reduce((s, p) => s + polygonArea(p), 0);
  }
}

function fmt(n: number): string {
  const s = n.toFixed(4);
  return s.replace(/\.?0+$/, '') || '0';
}

function hexToTrueColor(hex: string): number {
  return (parseInt(hex.slice(0, 2), 16) << 16) | (parseInt(hex.slice(2, 4), 16) << 8) | parseInt(hex.slice(4, 6), 16);
}

/** Group-code writer */
class Dxf {
  private lines: string[] = [];
  g(code: number, value: string | number) {
    this.lines.push(String(code), String(value));
  }
  section(name: string, body: () => void) {
    this.g(0, 'SECTION');
    this.g(2, name);
    body();
    this.g(0, 'ENDSEC');
  }
  toString() {
    return this.lines.join('\r\n') + '\r\n';
  }
}

/**
 * Build a DXF document.
 * @param layers   prepared layers (SVG space, y-down, px)
 * @param version  'R2000' | 'R12'
 * @param flipY    convert SVG y-down to CAD y-up (default true)
 * @param scale    px → document units multiplier (default PX_TO_MM)
 */
export function buildDxf(
  layers: Array<{ hex: string; name: string; paths: Pt[][] }>,
  version: 'R2000' | 'R12',
  flipY = true,
  scale = PX_TO_MM,
): string {
  const d = new Dxf();
  const tx = (p: Pt): Pt => ({ x: p.x * scale, y: (flipY ? -p.y : p.y) * scale });

  d.section('HEADER', () => {
    d.g(9, '$ACADVER');
    d.g(1, version === 'R2000' ? 'AC1015' : 'AC1009');
    if (version === 'R2000') {
      d.g(9, '$INSUNITS'); // 4 = millimetres — "units included"
      d.g(70, 4);
      d.g(9, '$MEASUREMENT');
      d.g(70, 1);
    }
    // extents
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const l of layers)
      for (const p of l.paths)
        for (const pt of p) {
          const t = tx(pt);
          minX = Math.min(minX, t.x); minY = Math.min(minY, t.y);
          maxX = Math.max(maxX, t.x); maxY = Math.max(maxY, t.y);
        }
    if (isFinite(minX)) {
      d.g(9, '$EXTMIN'); d.g(10, fmt(minX)); d.g(20, fmt(minY)); d.g(30, 0);
      d.g(9, '$EXTMAX'); d.g(10, fmt(maxX)); d.g(20, fmt(maxY)); d.g(30, 0);
    }
  });

  d.section('TABLES', () => {
    d.g(0, 'TABLE');
    d.g(2, 'LAYER');
    d.g(70, layers.length);
    for (const l of layers) {
      d.g(0, 'LAYER');
      d.g(2, l.name);
      d.g(70, 0);
      d.g(62, 7); // ACI white fallback
      d.g(6, 'CONTINUOUS');
      if (version === 'R2000') d.g(420, hexToTrueColor(l.hex)); // true color
    }
    d.g(0, 'ENDTAB');
  });

  d.section('ENTITIES', () => {
    for (const l of layers) {
      for (const rawPath of l.paths) {
        const pts = rawPath.map(tx);
        if (version === 'R2000') {
          d.g(0, 'LWPOLYLINE');
          d.g(8, l.name);
          d.g(90, pts.length);
          d.g(70, 1); // closed
          d.g(43, 0);
          for (const p of pts) {
            d.g(10, fmt(p.x));
            d.g(20, fmt(p.y));
          }
        } else {
          d.g(0, 'POLYLINE');
          d.g(8, l.name);
          d.g(66, 1); // vertices follow
          d.g(70, 1); // closed
          for (const p of pts) {
            d.g(0, 'VERTEX');
            d.g(8, l.name);
            d.g(10, fmt(p.x));
            d.g(20, fmt(p.y));
            d.g(30, 0);
          }
          d.g(0, 'SEQEND');
        }
      }
    }
  });

  d.g(0, 'EOF');
  return d.toString();
}
