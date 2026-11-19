// A section heading: a number, a title, and a hairline that runs to a short note.

import { Doc, n, measure } from './doc.mjs';
import { label, labelWidth } from './parts.mjs';
import { COLUMN, GUTTER } from './theme.mjs';

export function section(theme, { index, title, note }) {
  const W = COLUMN;
  const H = 66;
  const th = theme;
  const doc = new Doc({ w: W, h: H, theme, title });
  const x0 = GUTTER + 2; // lines up with the edge of the cards below
  const num = { font: 'mono-700', size: 10.5, tracking: 0.12 };

  let body = doc.text(index, { ...num, x: x0, y: 45, fill: th.accentText });
  const titleX = x0 + measure(index, num.font, num.size, num) + 14;
  body += doc.text(title, { x: titleX, y: 49, font: 'serif-400i', size: 36, fill: th.ink });
  const titleW = measure(title, 'serif-400i', 36);

  let end = W - x0;
  if (note) {
    body += label(doc, note, { x: end, y: 42.5, anchor: 'end', size: 9 });
    end -= labelWidth(note, { size: 9 }) + 16;
  }
  const start = titleX + titleW + 22;
  const grad = doc.uid('lg');
  doc.def(
    `<linearGradient id="${grad}" gradientUnits="userSpaceOnUse" x1="${n(start)}" y1="0" x2="${n(end)}" y2="0"><stop offset="0" stop-color="${th.line}" stop-opacity="${n(th.lineO + 0.24)}"/><stop offset="1" stop-color="${th.line}" stop-opacity="${n(th.lineO)}"/></linearGradient>`,
  );
  body += `<path d="M${n(start)} 39.5H${n(end)}" stroke="url(#${grad})"/>`;
  return doc.render(body);
}
