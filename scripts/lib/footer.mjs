// The closing image: a small plate, one line, one note.

import { Doc, n } from './doc.mjs';
import { plate } from './iso.mjs';
import { label } from './parts.mjs';
import { COLUMN } from './theme.mjs';

export function footer(theme, cfg) {
  const W = COLUMN;
  const H = 124;
  const th = theme;
  const doc = new Doc({ w: W, h: H, theme, title: `${cfg.footer.line} ${cfg.footer.note}` });
  const mid = W / 2;

  // The plate lands once. After that the image is still.
  doc.css('.land{animation:land .75s cubic-bezier(.2,.7,.2,1) .15s backwards}@keyframes land{from{opacity:0;transform:translateY(-10px)}}');

  const gl = doc.uid('fl');
  const gr = doc.uid('fr');
  const stop = (o) => `stop-color="${th.line}" stop-opacity="${n(o)}"`;
  doc.def(
    `<linearGradient id="${gl}" gradientUnits="userSpaceOnUse" x1="10" y1="0" x2="${mid - 40}" y2="0"><stop offset="0" ${stop(0)}/><stop offset="1" ${stop(th.lineO + 0.18)}/></linearGradient>` +
      `<linearGradient id="${gr}" gradientUnits="userSpaceOnUse" x1="${mid + 40}" y1="0" x2="${W - 10}" y2="0"><stop offset="0" ${stop(th.lineO + 0.18)}/><stop offset="1" ${stop(0)}/></linearGradient>`,
  );
  const p = plate(doc, { cx: mid, cy: 26, a: 20, b: 10, t: 4, kind: 'none', baseMarks: false });
  let body =
    `<path d="M10 30.500H${mid - 40}" stroke="url(#${gl})"/><path d="M${mid + 40} 30.500H${W - 10}" stroke="url(#${gr})"/>` +
    `<g class="land">${p.base}${p.lit}</g>`;

  body += doc.text(cfg.footer.line, { x: mid, y: 82, anchor: 'middle', font: 'serif-400i', size: 26, fill: th.ink });
  body += label(doc, cfg.footer.note, { x: mid, y: 107, anchor: 'middle', size: 8.8 });

  return doc.render(body);
}
