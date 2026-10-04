/**
 * tracer.ts — lazy loader + auto-tuned wrapper around the vendored VTracer
 * WASM build (@neplex/vectorizer browser build, vendored to
 * /vendor/vectorizer/). Parameter strategy follows 01.5 PoC findings:
 * default parameters explode noisy logos into ~88 layers; tuned parameters
 * (colorPrecision 8, cutout hierarchy) bring them down to ~9–17.
 * Everything runs locally — no network call except the same-origin WASM fetch.
 */

import { vectorize } from './engine-client';

export interface TraceOptions {
  /** 'auto' picks from input analysis; explicit values for the Precision slider */
  colorPrecision?: number;
  filterSpeckle?: number;
  layerDifference?: number;
  pathPrecision?: number;
  /** screenshot preset: cleaner input, fewer speckles */
  preset?: 'default' | 'screenshot';
}

export interface TraceResult {
  svg: string;
  width: number;
  height: number;
}

/** Decode image bytes to an <img> + canvas pipeline helpers. */
async function decodeToImageData(bytes: Uint8Array, type: string): Promise<ImageData> {
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type });
  const bmp = await createImageBitmap(blob);
  const canvas = document.createElement('canvas');
  // cap the working size — tracing huge rasters wastes time and layers
  const MAX = 1200;
  const scale = Math.min(1, MAX / Math.max(bmp.width, bmp.height));
  canvas.width = Math.max(1, Math.round(bmp.width * scale));
  canvas.height = Math.max(1, Math.round(bmp.height * scale));
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close();
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

/**
 * Classic preprocessing pipeline (PRD: 经典预处理为基线).
 * factor 2 = cleanup (jpg page switch), factor 4 = HD rescue enhancement.
 * 2x/4x canvas upscale with high-quality smoothing + light denoise.
 */
export async function preprocessImage(bytes: Uint8Array, type: string, factor: 2 | 4): Promise<Uint8Array> {
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type });
  const bmp = await createImageBitmap(blob);
  const canvas = document.createElement('canvas');
  canvas.width = bmp.width * factor;
  canvas.height = bmp.height * factor;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  // mild denoise: draw slightly blurred underneath, then sharp layer on top
  ctx.filter = 'blur(0.6px)';
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  ctx.filter = 'none';
  ctx.globalAlpha = 0.65;
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  ctx.globalAlpha = 1;
  bmp.close();
  const out = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!out) throw new Error('preprocess failed');
  return new Uint8Array(await out.arrayBuffer());
}

/** Rough colorfulness estimate to auto-tune parameters (01.5: 参数自适应). */
function estimateColorfulness(img: ImageData): number {
  const step = Math.max(1, Math.floor((img.width * img.height) / 4000));
  const seen = new Set<number>();
  for (let i = 0; i < img.data.length; i += 4 * step) {
    const r = img.data[i] >> 4;
    const g = img.data[i + 1] >> 4;
    const b = img.data[i + 2] >> 4;
    seen.add((r << 8) | (g << 4) | b);
    if (seen.size > 256) break;
  }
  return seen.size;
}

export async function traceImage(bytes: Uint8Array, mime: string, opts: TraceOptions = {}): Promise<TraceResult> {
  const img = await decodeToImageData(bytes, mime);
  const colorful = estimateColorfulness(img);

  // auto-tuned defaults (01.5 PoC): flat graphics & screenshots → precision 8;
  // noisy photo-ish input → lower precision + stronger speckle filter
  const noisy = colorful > 96 && opts.preset !== 'screenshot';
  const config = {
    colorMode: 0, // Color
    hierarchical: 1, // Cutout — no overlapping lines (01.5 hard requirement)
    filterSpeckle: opts.filterSpeckle ?? (opts.preset === 'screenshot' ? 4 : noisy ? 16 : 8),
    colorPrecision: opts.colorPrecision ?? (opts.preset === 'screenshot' ? 8 : noisy ? 6 : 8),
    layerDifference: opts.layerDifference ?? (noisy ? 32 : 16),
    mode: 2, // Spline — fewest nodes for smooth shapes
    cornerThreshold: 60,
    lengthThreshold: 4,
    maxIterations: 10,
    spliceThreshold: 45,
    pathPrecision: opts.pathPrecision ?? 2,
  };

  const svg: string = await vectorize(bytes, config);
  return { svg, width: img.width, height: img.height };
}

/** Precision slider 1..10 → re-trace config around the auto baseline. */
export function precisionConfig(value: number, preset?: TraceOptions['preset']): TraceOptions {
  const v = Math.max(1, Math.min(10, Math.round(value)));
  return {
    preset,
    colorPrecision: Math.max(4, Math.min(9, 4 + Math.round((v - 1) * (5 / 9)))),
    filterSpeckle: Math.max(2, 18 - v * 2),
    pathPrecision: v >= 8 ? 3 : 2,
  };
}
