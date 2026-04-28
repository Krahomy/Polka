type RGB = [number, number, number];

const NOISE_STRENGTH = 6;

function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export async function extractColor(url: string): Promise<RGB | null> {
  if (!url) return null;
  const img = await loadImage(url);
  if (!img) return null;
  try {
    const sz = 100;
    const c = document.createElement('canvas');
    c.width = c.height = sz;
    const ctx = c.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, sz, sz);
    const px = ctx.getImageData(0, 0, sz, sz).data;

    const LEVELS = 8;
    const STEP   = 256 / LEVELS;
    const buckets = new Float32Array(LEVELS * LEVELS * LEVELS * 4);

    for (let i = 0; i < px.length; i += 4) {
      const r = px[i], g = px[i + 1], b = px[i + 2];
      const br = r * 0.299 + g * 0.587 + b * 0.114;
      if (br < 20 || br > 230) continue;

      const bi = (
        Math.floor(r / STEP) * LEVELS * LEVELS +
        Math.floor(g / STEP) * LEVELS +
        Math.floor(b / STEP)
      ) * 4;
      buckets[bi]     += r;
      buckets[bi + 1] += g;
      buckets[bi + 2] += b;
      buckets[bi + 3] += 1;
    }

    let bestIdx = -1, bestW = 0;
    for (let i = 3; i < buckets.length; i += 4) {
      if (buckets[i] > bestW) { bestW = buckets[i]; bestIdx = i - 3; }
    }

    if (bestIdx < 0 || bestW === 0) return null;
    return [
      Math.round(buckets[bestIdx]     / bestW),
      Math.round(buckets[bestIdx + 1] / bestW),
      Math.round(buckets[bestIdx + 2] / bestW),
    ];
  } catch {
    return null;
  }
}

export function applyNoise(ctx: CanvasRenderingContext2D, w: number, h: number): void {

  const imageData = ctx.createImageData(w, h);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const val   = Math.random() > 0.5 ? 255 : 0;
    const alpha = Math.round(Math.random() * NOISE_STRENGTH * 1.8);
    data[i] = data[i + 1] = data[i + 2] = val;
    data[i + 3] = alpha;
  }
  ctx.putImageData(imageData, 0, 0);
}
