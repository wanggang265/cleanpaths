/**
 * bitmap.ts — 07 batch2: local raster transcode + SVG rasterize helpers.
 * All processing is in-browser, zero upload (03 P1-2).
 *
 * Families (05 v1.15 / PROMPT Task C):
 *   bitmap-transcode  webp→png (alpha preserved, P1) · webp→jpg · bmp→jpg
 *   svg-rasterize     svg→png / svg→jpg at intrinsic dims (no DPI/size UI, P3)
 *   first-frame       gif→jpg (frame 0 only — createImageBitmap default, P5)
 *   repack            jpeg→jpg lives in ToolController (byte passthrough, P4)
 *
 * JPG outputs fill transparent areas with WHITE (implementation detail the
 * frozen copy explicitly does not lock; the result preview shows the real
 * filled output, P2).
 */

/** Decode raster bytes → ImageBitmap. For animated GIF this yields frame 0
 *  (browser default) — exactly the P5 first-frame contract. */
export async function decodeRaster(bytes: Uint8Array, mime: string): Promise<ImageBitmap> {
  return createImageBitmap(new Blob([bytes.buffer as ArrayBuffer], { type: mime }));
}

/** Encode an ImageBitmap to PNG (alpha kept) or JPG (alpha → white fill). */
export async function encodeBitmap(bmp: ImageBitmap, outMime: 'image/png' | 'image/jpeg'): Promise<Blob> {
  const paint = (ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D) => {
    if (outMime === 'image/jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, bmp.width, bmp.height);
    }
    ctx.drawImage(bmp, 0, 0);
  };
  if (typeof OffscreenCanvas !== 'undefined') {
    const c = new OffscreenCanvas(bmp.width, bmp.height);
    paint(c.getContext('2d')!);
    return c.convertToBlob({ type: outMime });
  }
  const c = document.createElement('canvas');
  c.width = bmp.width;
  c.height = bmp.height;
  paint(c.getContext('2d')!);
  return new Promise<Blob>((res, rej) =>
    c.toBlob((b) => (b ? res(b) : rej(new Error(`${outMime} encode failed`))), outMime),
  );
}

/** Intrinsic SVG size: width/height attrs → viewBox → 300×150 fallback
 *  (same resolution rules as the svg-dxf path's svgDims). */
export function svgIntrinsicDims(svgText: string): { w: number; h: number } {
  const w = parseFloat(svgText.match(/width="([\d.]+)/)?.[1] || '');
  const h = parseFloat(svgText.match(/height="([\d.]+)/)?.[1] || '');
  const vb = svgText
    .match(/viewBox="([\d.\s-]+)"/)?.[1]
    ?.split(/[\s]+/)
    .map(parseFloat);
  return { w: isFinite(w) ? w : vb?.[2] ?? 300, h: isFinite(h) ? h : vb?.[3] ?? 150 };
}

/** Rasterize SVG text → PNG/JPG blob at the SVG's intrinsic size. */
export async function rasterizeSvg(
  svgText: string,
  outMime: 'image/png' | 'image/jpeg',
): Promise<{ blob: Blob; width: number; height: number }> {
  const srcBlob = new Blob([svgText], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(srcBlob);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const el = new Image();
      el.onload = () => res(el);
      el.onerror = () => rej(new Error('svg rasterize failed'));
      el.src = url;
    });
    // naturalWidth resolves intrinsic dims (attrs or viewBox); fall back to parse.
    const dims = svgIntrinsicDims(svgText);
    const w = img.naturalWidth || dims.w;
    const h = img.naturalHeight || dims.h;
    const bmp = await createImageBitmap(img);
    const blob = await encodeBitmap(bmp, outMime);
    bmp.close();
    return { blob, width: w, height: h };
  } finally {
    URL.revokeObjectURL(url);
  }
}
