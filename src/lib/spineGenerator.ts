// ─── Constants (hardcoded defaults from spine-test.html) ─────────────────────

const GRADIENT     = 0.55;
const HIGHLIGHT    = 0.20;
const BRIGHTNESS   = 1.10;
const SATURATION   = 1.00;
const DECOR_OPACITY = 0.65;
const SHOW_AUTHOR  = true;
const SHOW_DIVIDER = true;

// ─── Types ────────────────────────────────────────────────────────────────────

type RGB = [number, number, number];

interface FontDef {
  family: string;
  weight: string;
  style: string;
  spacing: string;
}

interface DecorDef {
  id: string;
}

export interface SpineBook {
  id: number;
  title: string;
  author?: string;
  pages?: number;
}

// ─── Font pool ────────────────────────────────────────────────────────────────

const FONTS: FontDef[] = [
  { family: 'Playfair Display',   weight: '400', style: 'normal', spacing: '0.04em'  },
  { family: 'Bebas Neue',         weight: '400', style: 'normal', spacing: '0.12em'  },
  { family: 'Oswald',             weight: '600', style: 'normal', spacing: '0.06em'  },
  { family: 'Cormorant Garamond', weight: '600', style: 'italic', spacing: '0.02em'  },
  { family: 'Raleway',            weight: '700', style: 'normal', spacing: '0.08em'  },
  { family: 'Abril Fatface',      weight: '400', style: 'normal', spacing: '0.01em'  },
  { family: 'Cinzel',             weight: '400', style: 'normal', spacing: '0.1em'   },
  { family: 'EB Garamond',        weight: '500', style: 'italic', spacing: '0.03em'  },
  { family: 'Josefin Sans',       weight: '300', style: 'normal', spacing: '0.18em'  },
  { family: 'Spectral',           weight: '500', style: 'normal', spacing: '0.02em'  },
];

const DECORS: DecorDef[] = [
  { id: 'decor_1' },
  { id: 'decor_2' },
  { id: 'decor_3' },
  { id: 'decor_4' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function luminance(r: number, g: number, b: number): number {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function adj(r: number, g: number, b: number, factor: number, offset = 0): RGB {
  return [
    clamp(Math.round(r * factor + offset), 0, 255),
    clamp(Math.round(g * factor + offset), 0, 255),
    clamp(Math.round(b * factor + offset), 0, 255),
  ];
}

function esc(s: string): string {
  return s.replace(/[<>&'"]/g, c => (
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' } as Record<string, string>)[c]
  ));
}

function hslToRgb(h: number, s: number, l: number): RGB {
  let r: number, g: number, b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function getBookFont(bookId: number): FontDef {
  const h = (bookId * 2654435761) >>> 0;
  return FONTS[h % FONTS.length];
}

function getBookDecors(bookId: number): { top: DecorDef } {
  const h = (bookId * 2654435761) >>> 0;
  return { top: DECORS[h % DECORS.length] };
}

function fitText(text: string, availLen: number, minSz: number, maxSz: number): { sz: number; text: string } {
  const sz = clamp(availLen / (text.length * 0.65), minSz, maxSz);
  const maxChars = Math.floor(availLen / (minSz * 0.65)) - 1;
  const out = (sz === minSz && text.length > maxChars) ? text.slice(0, maxChars) + '…' : text;
  return { sz: Math.round(sz * 10) / 10, text: out };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function spineWidth(pages?: number): number {
  if (!pages || pages <= 0) return 22;
  return Math.round(clamp(pages * 0.065, 12, 64));
}

export function titleToRgb(title: string): RGB {
  let h = 5381;
  for (let i = 0; i < title.length; i++) h = (Math.imul(h, 33) ^ title.charCodeAt(i)) >>> 0;
  const hue = h % 360;
  const sat = 28 + (h >> 4) % 22;
  const lig = 22 + (h >> 8) % 18;
  return hslToRgb(hue / 360, sat / 100, lig / 100);
}

export function applyColorSettings(r: number, g: number, b: number): RGB {
  r = clamp(Math.round(r * BRIGHTNESS), 0, 255);
  g = clamp(Math.round(g * BRIGHTNESS), 0, 255);
  b = clamp(Math.round(b * BRIGHTNESS), 0, 255);

  if (SATURATION === 1) return [r, g, b];

  const grey = r * 0.299 + g * 0.587 + b * 0.114;
  return [
    clamp(Math.round(grey + (r - grey) * SATURATION), 0, 255),
    clamp(Math.round(grey + (g - grey) * SATURATION), 0, 255),
    clamp(Math.round(grey + (b - grey) * SATURATION), 0, 255),
  ];
}

export function buildSpineSVG(book: SpineBook, rgb: RGB, heightPx: number): string {
  const id   = 'b' + book.id;
  const w    = spineWidth(book.pages);
  const h    = heightPx;
  const font = getBookFont(book.id);

  const [r, g, b2] = rgb;
  const lum   = luminance(r, g, b2);
  const light = lum > 0.18;

  const textMain = light ? 'rgba(10,8,5,0.88)'    : 'rgba(255,255,255,0.92)';
  const textSub  = light ? 'rgba(10,8,5,0.50)'    : 'rgba(255,255,255,0.55)';
  const divColor = light ? 'rgba(0,0,0,0.18)'     : 'rgba(255,255,255,0.2)';

  const grd = GRADIENT;
  const [lr, lg, lb] = adj(r, g, b2, 1 + grd * 0.5,  grd * 40);
  const [dr, dg, db] = adj(r, g, b2, 1 - grd * 0.38, 0);
  const hl = HIGHLIGHT;

  const pad   = h * 0.08;
  const avail = h - pad * 2;

  const titleMaxSz    = Math.min(Math.round(w * 0.65), 18);
  const hh            = (book.id * 2654435761) >>> 0;
  const titleUppercase = ((hh >>> 3) & 1) === 1;
  const displayTitle   = titleUppercase ? book.title.toUpperCase() : book.title;
  let   titleFit      = fitText(displayTitle, avail, 7, titleMaxSz);
  const titleEstLen   = titleFit.text.length * 0.65 * titleFit.sz;
  const titleIsShort  = titleEstLen < avail * 0.55;
  const titleNeedsLen = titleEstLen >= avail * 0.80;

  const authorFit = (SHOW_AUTHOR && book.author && titleIsShort)
    ? fitText(book.author, avail * 0.40, 5.5, 9)
    : null;

  // Uppercase-only title (no author): reduce font size by 15%
  if (titleUppercase && !authorFit) {
    titleFit = { ...titleFit, sz: Math.round(titleFit.sz * 0.85 * 10) / 10 };
  }

  const tCX = w / 2;
  const tCY = authorFit ? h * 0.36 : h * 0.5;
  const aCX = w / 2;
  const aCY = h * 0.69;
  const divY = h * 0.50;

  const filterTag = !light
    ? `<filter id="ts_${id}" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="0.6" stdDeviation="0.9" flood-color="rgba(0,0,0,0.7)"/>
       </filter>`
    : '';
  const filterRef = !light ? `filter="url(#ts_${id})"` : '';

  // Decoration
  const dSz       = Math.max(Math.min(w - 2, 18), 6);
  const decors    = getBookDecors(book.id);
  const decorAtTop = (hh % 2 === 0);
  const decorX    = (w - dSz) / 2;

  const effectiveTitleLen = titleNeedsLen ? avail : titleEstLen;
  const textTopY     = tCY - effectiveTitleLen / 2;
  const authorEstLen = authorFit ? authorFit.text.length * 0.65 * authorFit.sz : 0;
  const textBotY     = authorFit ? aCY + authorEstLen / 2 : tCY + effectiveTitleLen / 2;
  const safeGap      = 2;

  const topDecorY = Math.round(pad * 0.4);
  const botDecorY = h - dSz - Math.round(pad * 0.4);
  const topClear  = (topDecorY + dSz + safeGap) <= textTopY;
  const botClear  = (botDecorY - safeGap) >= textBotY;

  let finalDecorY: number | null = null;
  if (decorAtTop && topClear)  finalDecorY = topDecorY;
  if (!decorAtTop && botClear) finalDecorY = botDecorY;

  const decorSVG = (DECOR_OPACITY > 0 && finalDecorY !== null)
    ? `<svg x="${decorX.toFixed(1)}" y="${finalDecorY}" width="${dSz}" height="${dSz}" opacity="${DECOR_OPACITY}"><use href="#${decors.top.id}"/></svg>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 ${w} ${h}">
<defs>
  <linearGradient id="bg_${id}" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%"   stop-color="rgb(${lr},${lg},${lb})"/>
    <stop offset="18%"  stop-color="rgb(${r},${g},${b2})"/>
    <stop offset="100%" stop-color="rgb(${dr},${dg},${db})"/>
  </linearGradient>
  <clipPath id="cp_${id}">
    <rect x="0" y="${pad}" width="${w}" height="${avail}"/>
  </clipPath>
  ${filterTag}
</defs>
<rect width="${w}" height="${h}" fill="url(#bg_${id})"/>
<rect x="0" y="0" width="1.5" height="${h}" fill="rgba(255,255,255,${hl})"/>
<rect x="${w - 1}" y="0" width="1" height="${h}" fill="rgba(0,0,0,0.14)"/>
<rect x="0" y="0" width="${w}" height="2" fill="rgba(255,255,255,0.12)" rx="0.5"/>
<g clip-path="url(#cp_${id})">
<text
  x="${tCX}" y="${tCY}"
  font-family="'${font.family}',Georgia,serif"
  font-size="${titleFit.sz}px"
  font-weight="${font.weight}"
  font-style="${font.style}"
  letter-spacing="${font.spacing}"
  fill="${textMain}"
  text-anchor="middle"
  dominant-baseline="middle"
  transform="rotate(-90,${tCX},${tCY})"
  ${titleNeedsLen ? `textLength="${avail}" lengthAdjust="spacingAndGlyphs"` : ''}
  ${filterRef}
>${esc(titleFit.text)}</text>
</g>
${authorFit ? `
${SHOW_DIVIDER ? `<line x1="${w * 0.15}" y1="${divY}" x2="${w * 0.85}" y2="${divY}" stroke="${divColor}" stroke-width="0.6"/>` : ''}
<g clip-path="url(#cp_${id})">
<text
  x="${aCX}" y="${aCY}"
  font-family="'${font.family}',Georgia,serif"
  font-size="${authorFit.sz}px"
  font-weight="${font.weight}"
  font-style="${font.style}"
  fill="${textSub}"
  text-anchor="middle"
  dominant-baseline="middle"
  transform="rotate(-90,${aCX},${aCY})"
>${esc(authorFit.text)}</text>
</g>` : ''}
${decorSVG}
</svg>`;
}
