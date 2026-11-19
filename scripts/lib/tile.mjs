// One tile per layer of the stack: the plate, a title, two lines, the tools.

import { Doc } from './doc.mjs';
import { plate } from './iso.mjs';
import { frame, hair, techLine, label } from './parts.mjs';
import { GUTTER, TILE_W } from './theme.mjs';

export function tile(theme, layer, i) {
  const W = TILE_W;
  const H = 246;
  const th = theme;
  const doc = new Doc({ w: W, h: H, theme, title: `${layer.title}. ${layer.text} Tools: ${layer.tech.join(', ')}.` });
  const g = GUTTER;
  const left = g + 22;
  const right = W - g - 22;

  // The plate lands once, when the tile first shows. After that the tile is
  // still, so six tiles on screen cost the browser nothing.
  const wait = 120 + (i % 3) * 110;
  doc.css(`
    .land{animation:land .75s cubic-bezier(.2,.7,.2,1) ${wait}ms backwards}
    @keyframes land{from{opacity:0;transform:translateY(-12px)}}
    .shd{animation:shd .75s ease-out ${wait}ms backwards}
    @keyframes shd{from{opacity:0}}
  `);

  let body = frame(doc, { x: g, y: g, w: W - g * 2, h: H - g * 2, r: 14 });

  // the plate, lit in the accent colour
  const cx = left + 44;
  const cy = g + 46;
  const p = plate(doc, { cx, cy, a: 44, b: 22, t: 7, kind: layer.art, baseMarks: false, markWidth: 1.2 });
  body +=
    `<ellipse class="shd" cx="${cx}" cy="${cy + 39}" rx="32" ry="4" fill="${th.shadow}" fill-opacity="${th.id === 'dark' ? 0.5 : 0.14}"/>` +
    `<g class="land">${p.base}${p.lit}</g>`;

  body += label(doc, String(i + 1).padStart(2, '0'), { x: right, y: g + 31, anchor: 'end', size: 10, font: 'mono-500' });

  body += doc.text(layer.title, { x: left, y: g + 113, font: 'sans-700', size: 17.5, tracking: -0.01, fill: th.ink });
  body += doc.paragraph(layer.text, {
    x: left,
    y: g + 136,
    width: right - left,
    lineHeight: 18.5,
    maxLines: 3,
    font: 'sans-400',
    size: 12.75,
    fill: th.muted,
  }).markup;

  body += hair(doc, left, g + 201.5, right);
  body += techLine(doc, layer.tech, { x: left, y: g + 221, width: right - left });

  return doc.render(body);
}
