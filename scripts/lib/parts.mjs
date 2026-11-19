// Small pieces shared by the cards.

import { n, measure, fit } from './doc.mjs';

/** The surface of a card: a faint fill and a hairline border. */
export function frame(doc, { x, y, w, h, r = 16 }) {
  const th = doc.theme;
  return `<rect x="${x + 0.5}" y="${y + 0.5}" width="${w - 1}" height="${h - 1}" rx="${r}" fill="${th.card}" fill-opacity="${th.cardO}" stroke="${th.line}" stroke-opacity="${th.lineO}"/>`;
}

/** A horizontal hairline. */
export function hair(doc, x1, y, x2, extra = 0) {
  const th = doc.theme;
  return `<path d="M${n(x1)} ${n(y)}H${n(x2)}" stroke="${th.line}" stroke-opacity="${n(th.lineO + extra)}"/>`;
}

const LABEL = { font: 'mono-500', size: 9.2, tracking: 0.06 };

/** A row of technology names, shrunk a little when it would not fit. */
export function techLine(doc, tech, { x, y, width, fill }) {
  const str = tech.join(' · ').toUpperCase();
  const size = fit(str, LABEL.font, width, LABEL.size, LABEL);
  return doc.text(str, { ...LABEL, x, y, size, fill: fill || doc.theme.text });
}

/** A small caps label. */
export function label(doc, str, { x, y, fill, anchor, font = LABEL.font, size = LABEL.size, tracking = 0.12 }) {
  return doc.text(String(str).toUpperCase(), { x, y, anchor, font, size, tracking, fill: fill || doc.theme.faint });
}

export function labelWidth(str, { font = LABEL.font, size = LABEL.size, tracking = 0.12 } = {}) {
  return measure(String(str).toUpperCase(), font, size, { tracking });
}

/** "LIVE" with a status dot. x is the left edge, or the right edge with anchor end. */
export function live(doc, { x, y, anchor = 'start', text = 'Live' }) {
  const th = doc.theme;
  const opts = { font: 'mono-700', size: 8.8, tracking: 0.14 };
  const tw = labelWidth(text, opts);
  const left = anchor === 'end' ? x - tw - 12 : x;
  return (
    statusDot(doc, left + 3, y - 3.1, 3) +
    label(doc, text, { ...opts, x: left + 12, y, fill: th.accentText })
  );
}

/**
 * A dot that blinks like a status light: a soft ring that is on, then off.
 * It changes twice per cycle and is still in between, so it costs the browser
 * almost nothing. A smooth pulse would redraw the whole image on every frame.
 */
export function statusDot(doc, cx, cy, r) {
  const th = doc.theme;
  if (!doc.hasStatusDot) {
    doc.css('.led{animation:led 2.8s steps(1,end) infinite}@keyframes led{50%{opacity:0}}');
    doc.hasStatusDot = true;
  }
  return (
    `<circle class="led" cx="${n(cx)}" cy="${n(cy)}" r="${n(r * 2.1)}" fill="${th.accent}" fill-opacity=".28"/>` +
    `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${th.accent}"/>`
  );
}

/** A small arrow pointing up and to the right, for links. */
export function arrow(x, y, size, color, width = 1.4) {
  const s = size;
  return `<path d="M${n(x)} ${n(y + s)}L${n(x + s)} ${n(y)}M${n(x + s * 0.28)} ${n(y)}H${n(x + s)}V${n(y + s * 0.72)}" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
}
