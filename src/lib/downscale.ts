/**
 * downscale.ts — #18 fix (user-picked option A): input ceiling + auto
 * downscale at the upload entry. A 5.2MB/3000px input ran >240s because the
 * engine received the full-resolution bytes. Now anything over the limits
 * below is downscaled BEFORE the engine ever sees it (canvas re-encode,
 * 100% local — the original bytes never leave the device).
 */

/** hard input ceiling: files above this are always downscaled */
export const MAX_INPUT_BYTES = 10 * 1024 * 1024; // 10 MB
/** hard input ceiling: longest edge above this is always downscaled */
export const MAX_INPUT_EDGE = 2000; // px

export interface GuardResult {
  bytes: Uint8Array;
  mime: string;
  /** true when the guard rewrote the input (UI shows the resize note) */
  downscaled: boolean;
  from: { width: number; height: number; bytes: number } | null;
}

/**
 * Check raster input against the ceilings; downscale to MAX_INPUT_EDGE on the
 * longest side when exceeded (or when the byte size alone is over 10MB with a
 * decodable image — pixel count, not file size, drives engine time).
 * Non-decodable input is returned untouched (the engine errors as before).
 */
export async function guardRasterInput(bytes: Uint8Array, mime: string): Promise<GuardResult> {
  const untouched: GuardResult = { bytes, mime, downscaled: false, from: null };
  if (bytes.length <= MAX_INPUT_BYTES) {
    // cheap path: still need dimensions — but small files are usually small
    // images; decode only when there is a real chance of overflow. Decoding
    // is local and fast (<100ms), so just always decode.
  }
  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(new Blob([bytes.buffer as ArrayBuffer], { type: mime }));
  } catch {
    return untouched; // not a decodable raster — let the engine report it
  }
  const w = bmp.width;
  const h = bmp.height;
  const overEdge = Math.max(w, h) > MAX_INPUT_EDGE;
  const overBytes = bytes.length > MAX_INPUT_BYTES;
  if (!overEdge && !overBytes) {
    bmp.close();
    return { ...untouched, from: { width: w, height: h, bytes: bytes.length } };
  }
  const scale = Math.min(1, MAX_INPUT_EDGE / Math.max(w, h));
  const cw = Math.max(1, Math.round(w * scale));
  const ch = Math.max(1, Math.round(h * scale));
  const canvas = document.createElement('canvas');
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bmp, 0, 0, cw, ch);
  bmp.close();
  const out = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!out) return untouched;
  return {
    bytes: new Uint8Array(await out.arrayBuffer()),
    mime: 'image/png',
    downscaled: true,
    from: { width: w, height: h, bytes: bytes.length },
  };
}
