// One SVG document, plus a small text engine.
//
// Text is drawn as glyph outlines, not as <text>. An image inside a README
// cannot load a web font, so outlines are the only way to get the same
// typography in every browser. Each glyph is defined once and reused.

import opentype from 'opentype.js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const fontFile = (pkg, name) => path.join(ROOT, 'node_modules', '@fontsource', pkg, 'files', name);

const FONT_FILES = {
  'sans-400': fontFile('inter-tight', 'inter-tight-latin-400-normal.woff'),
  'sans-500': fontFile('inter-tight', 'inter-tight-latin-500-normal.woff'),
  'sans-600': fontFile('inter-tight', 'inter-tight-latin-600-normal.woff'),
  'sans-700': fontFile('inter-tight', 'inter-tight-latin-700-normal.woff'),
  'sans-800': fontFile('inter-tight', 'inter-tight-latin-800-normal.woff'),
  'serif-400': fontFile('instrument-serif', 'instrument-serif-latin-400-normal.woff'),
  'serif-400i': fontFile('instrument-serif', 'instrument-serif-latin-400-italic.woff'),
  'mono-400': fontFile('jetbrains-mono', 'jetbrains-mono-latin-400-normal.woff'),
  'mono-500': fontFile('jetbrains-mono', 'jetbrains-mono-latin-500-normal.woff'),
  'mono-700': fontFile('jetbrains-mono', 'jetbrains-mono-latin-700-normal.woff'),
};

const fontCache = new Map();

export function font(key) {
  if (!fontCache.has(key)) {
    const file = FONT_FILES[key];
    if (!file) throw new Error(`Unknown font "${key}"`);
    const buf = readFileSync(file);
    fontCache.set(key, opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)));
  }
  return fontCache.get(key);
}

/** Round to two decimals and drop trailing zeros. */
export const n = (v) => String(Math.round(v * 100) / 100);

/** Blend two hex colours. t runs from 0 to 1. */
export function mix(from, to, t) {
  const a = parseInt(from.slice(1), 16);
  const b = parseInt(to.slice(1), 16);
  const ch = (shift) => Math.round(((a >> shift) & 255) + (((b >> shift) & 255) - ((a >> shift) & 255)) * t);
  return `#${((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1).toUpperCase()}`;
}

export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Lay a string out in font units. Kerning and tracking are applied. */
export function layout(str, fontKey, { tracking = 0 } = {}) {
  const f = font(fontKey);
  const glyphs = f.stringToGlyphs(String(str));
  const unit = EM / f.unitsPerEm;
  const track = tracking * EM;
  const items = [];
  let x = 0;
  for (let i = 0; i < glyphs.length; i++) {
    const g = glyphs[i];
    items.push({ glyph: g, x });
    let adv = (g.advanceWidth || 0) * unit;
    if (i < glyphs.length - 1) adv += f.getKerningValue(g, glyphs[i + 1]) * unit + track;
    x += adv;
  }
  return { items, width: x, upm: EM };
}

/** Width of a string in pixels. */
export function measure(str, fontKey, size, opts) {
  const l = layout(str, fontKey, opts);
  return (l.width * size) / l.upm;
}

/**
 * Break a string into lines that fit maxWidth.
 * The lines are balanced: the same number of lines, but no lonely last word.
 */
export function wrap(str, fontKey, size, maxWidth, opts) {
  const words = String(str).split(/\s+/).filter(Boolean);
  const lines = greedy(words, fontKey, size, maxWidth, opts);
  if (lines.length < 2) return lines;
  let low = maxWidth * 0.5;
  let high = maxWidth;
  let best = lines;
  for (let i = 0; i < 12; i++) {
    const mid = (low + high) / 2;
    const attempt = greedy(words, fontKey, size, mid, opts);
    if (attempt.length <= lines.length) {
      best = attempt;
      high = mid;
    } else {
      low = mid;
    }
  }
  return best;
}

function greedy(words, fontKey, size, maxWidth, opts) {
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (line && measure(next, fontKey, size, opts) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Cut a string that is too wide, and end it with three dots. */
export function truncate(str, fontKey, size, maxWidth, opts) {
  let s = String(str);
  if (measure(s, fontKey, size, opts) <= maxWidth) return s;
  while (s.length > 1 && measure(`${s}...`, fontKey, size, opts) > maxWidth) s = s.slice(0, -1);
  return `${s.replace(/[ ._-]+$/, '')}...`;
}

/** Largest size (up to max) at which the string fits maxWidth. */
export function fit(str, fontKey, maxWidth, max, opts) {
  const w = measure(str, fontKey, max, opts);
  return w <= maxWidth ? max : Math.floor(((max * maxWidth) / w) * 10) / 10;
}

// Glyph outlines are stored on a 1000 unit em, whatever the font uses inside.
const EM = 1000;

/** Outline of one glyph as compact path data (relative commands, whole numbers). */
function glyphPathData(f, glyph) {
  const r = Math.round;
  let d = '';
  let last = '';
  let px = 0;
  let py = 0;
  let startX = 0;
  let startY = 0;
  const put = (cmd, nums) => {
    let s = cmd === last ? (nums[0] < 0 ? '' : ' ') : cmd;
    nums.forEach((v, i) => {
      s += (i > 0 && v >= 0 ? ' ' : '') + v;
    });
    d += s;
    last = cmd;
  };
  for (const c of glyph.getPath(0, 0, EM).commands) {
    if (c.type === 'Z') {
      d += 'z';
      last = 'z';
      px = startX;
      py = startY;
      continue;
    }
    const x = r(c.x);
    const y = r(c.y);
    if (c.type === 'M') {
      d += `M${x}${y < 0 ? '' : ' '}${y}`;
      last = 'M';
      startX = x;
      startY = y;
    } else if (c.type === 'L') {
      if (y === py) put('h', [x - px]);
      else if (x === px) put('v', [y - py]);
      else put('l', [x - px, y - py]);
    } else if (c.type === 'Q') {
      put('q', [r(c.x1) - px, r(c.y1) - py, x - px, y - py]);
    } else if (c.type === 'C') {
      put('c', [r(c.x1) - px, r(c.y1) - py, r(c.x2) - px, r(c.y2) - py, x - px, y - py]);
    }
    px = x;
    py = y;
  }
  return d;
}

export class Doc {
  constructor({ w, h, theme, title }) {
    this.w = w;
    this.h = h;
    this.theme = theme;
    this.title = title;
    this.glyphIds = new Map();
    this.glyphDefs = [];
    this.defs = [];
    this.styles = [];
    this.stillStyles = [];
    this.count = 0;
  }

  /** A short id that is unique inside this document. */
  uid(prefix = 'u') {
    return `${prefix}${(this.count++).toString(36)}`;
  }

  def(markup) {
    this.defs.push(markup);
  }

  css(rules) {
    this.styles.push(rules.replace(/\s*\n\s*/g, '').trim());
  }

  /** Rules for people who asked their system for reduced motion. All animation is off for them. */
  still(rules) {
    this.stillStyles.push(rules.replace(/\s*\n\s*/g, '').trim());
  }

  glyph(fontKey, glyph) {
    const key = `${fontKey}:${glyph.index}`;
    let id = this.glyphIds.get(key);
    if (!id) {
      id = `g${this.glyphIds.size.toString(36)}`;
      this.glyphIds.set(key, id);
      this.glyphDefs.push(`<path id="${id}" d="${glyphPathData(font(fontKey), glyph)}"/>`);
    }
    return id;
  }

  /**
   * Draw one line of text.
   * anchor: start | middle | end. tracking is in em.
   * rise: when set, every glyph gets class "ch" and a stagger index, for a reveal animation.
   * ramp: [from, to] hex colours. Each glyph gets its own colour, so the line
   *       reads as a gradient without a mask (a mask is slow to animate).
   */
  text(str, { x = 0, y = 0, font: fontKey = 'sans-500', size = 14, fill, anchor = 'start', tracking = 0, opacity, cls, rise, ramp } = {}) {
    const l = layout(str, fontKey, { tracking });
    const scale = size / l.upm;
    const width = l.width * scale;
    const ox = anchor === 'end' ? x - width : anchor === 'middle' ? x - width / 2 : x;
    let uses = '';
    let k = rise ? rise.start || 0 : 0;
    for (const { glyph, x: gx } of l.items) {
      if (!glyph.path || glyph.path.commands.length === 0) continue;
      const id = this.glyph(fontKey, glyph);
      const pos = gx ? ` x="${n(gx)}"` : '';
      const tint = ramp ? ` fill="${mix(ramp[0], ramp[1], l.width ? gx / l.width : 0)}"` : '';
      if (rise) uses += `<use class="ch" style="--k:${k++}" href="#${id}"${pos}${tint}/>`;
      else uses += `<use href="#${id}"${pos}${tint}/>`;
    }
    const attrs =
      (cls ? ` class="${cls}"` : '') +
      (fill ? ` fill="${fill}"` : '') +
      (opacity != null ? ` opacity="${n(opacity)}"` : '') +
      (rise ? ` style="--r:${Math.round((rise.distance || 14) / scale)}px"` : '');
    return `<g transform="translate(${n(ox)} ${n(y)}) scale(${String(Math.round(scale * 1e5) / 1e5)})"${attrs}>${uses}</g>`;
  }

  /** Draw wrapped lines. Returns the markup and the number of lines. */
  paragraph(str, { x = 0, y = 0, width, lineHeight, maxLines = 99, ...opts }) {
    const lines = wrap(str, opts.font || 'sans-500', opts.size || 14, width, { tracking: opts.tracking || 0 }).slice(0, maxLines);
    const markup = lines.map((line, i) => this.text(line, { ...opts, x, y: y + i * lineHeight })).join('');
    return { markup, lines: lines.length };
  }

  render(body) {
    const reduce = `@media (prefers-reduced-motion:reduce){*{animation:none!important}${this.stillStyles.join('')}}`;
    const style = this.styles.length ? `<style>${this.styles.join('')}${reduce}</style>` : '';
    return (
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.w} ${this.h}" width="${this.w}" height="${this.h}" fill="none" role="img" aria-label="${esc(this.title)}">` +
      `<title>${esc(this.title)}</title>` +
      `<defs>${this.glyphDefs.join('')}${this.defs.join('')}</defs>` +
      style +
      body +
      '</svg>\n'
    );
  }
}
