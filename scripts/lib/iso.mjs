// Isometric plates. One plate stands for one layer of the stack.
//
// A plate is designed on a flat 100 x 100 square, then projected with a matrix.
// The square's corner (0,0) is the back of the plate, (100,100) is the front.

import { n } from './doc.mjs';

const RADIUS = 9; // corner radius of a plate, in design units

/** Matrix that maps the 100 x 100 design square onto the top face. */
export function faceMatrix(cx, cy, a, b) {
  return `matrix(${n(a / 100)} ${n(b / 100)} ${n(-a / 100)} ${n(b / 100)} ${n(cx)} ${n(cy - b)})`;
}

/** Shared gradients and CSS for plates. Call once per document. */
export function plateDefs(doc) {
  const p = doc.theme.plate;
  if (doc.plateIds) return doc.plateIds;
  const top = doc.uid('pt');
  const sideP = doc.uid('ps');
  const sideR = doc.uid('pr');
  doc.def(
    `<linearGradient id="${top}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.top0}"/><stop offset="1" stop-color="${p.top1}"/></linearGradient>` +
      `<linearGradient id="${sideP}" x1="0" y1="1" x2="1" y2="0"><stop offset=".5" stop-color="${p.left}"/><stop offset=".5" stop-color="${p.right}"/></linearGradient>` +
      `<linearGradient id="${sideR}" x1="0" y1="0" x2="1" y2="0"><stop offset=".5" stop-color="${p.left}"/><stop offset=".5" stop-color="${p.right}"/></linearGradient>`,
  );
  doc.css('.ns *{vector-effect:non-scaling-stroke}');
  doc.plateIds = { top, sideP, sideR };
  return doc.plateIds;
}

/**
 * The marks drawn on a plate, in design units.
 * line: stroke colour. soft: translucent fill. solid: small solid fills.
 */
export function marks(kind, { line, soft, solid, softO = 0.2, width = 1.3 }) {
  const s = `stroke="${line}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"`;
  const softFill = `fill="${soft}" fill-opacity="${softO}"`;
  switch (kind) {
    case 'web':
      return (
        `<rect x="15" y="15" width="70" height="70" rx="6" ${s}/>` +
        `<path d="M15 31H85" ${s}/>` +
        `<circle cx="23" cy="23" r="2.1" fill="${solid}"/><circle cx="30.5" cy="23" r="2.1" fill="${solid}"/><circle cx="38" cy="23" r="2.1" fill="${solid}"/>` +
        `<rect x="23" y="39" width="25" height="38" rx="3" ${softFill} ${s}/>` +
        `<path d="M56 43H77M56 52H77M56 61H69" ${s}/>` +
        `<rect x="56" y="69" width="17" height="8" rx="4" fill="${solid}"/>`
      );
    case 'ai':
      return (
        `<path d="M50 17C52.4 39 61 47.6 83 50C61 52.4 52.4 61 50 83C47.6 61 39 52.4 17 50C39 47.6 47.6 39 50 17Z" ${softFill} ${s}/>` +
        `<path d="M79 14C79.9 20.6 81.4 22.1 88 23C81.4 23.9 79.9 25.4 79 32C78.1 25.4 76.6 23.9 70 23C76.6 22.1 78.1 20.6 79 14Z" fill="${solid}"/>` +
        `<circle cx="23" cy="78" r="2.6" fill="${solid}"/>`
      );
    case 'commerce': {
      let out = '';
      for (const y of [18, 43]) {
        for (const x of [16, 41, 66]) {
          const picked = x === 41 && y === 18;
          out += `<rect x="${x}" y="${y}" width="18" height="18" rx="4" ${picked ? `fill="${solid}"` : softFill} ${s}/>`;
        }
      }
      return out + `<path d="M16 77H52" ${s}/><rect x="62" y="70" width="22" height="14" rx="7" ${softFill} ${s}/>`;
    }
    case 'automation':
      return (
        `<rect x="14" y="22" width="19" height="19" rx="5" ${softFill} ${s}/>` +
        `<rect x="40.5" y="22" width="19" height="19" rx="5" ${s}/>` +
        `<rect x="67" y="22" width="19" height="19" rx="5" fill="${solid}" ${s}/>` +
        `<path d="M33 31.5H40.5M59.5 31.5H67" ${s}/>` +
        `<path d="M76.5 41V62Q76.5 72 66.5 72H33.5Q23.5 72 23.5 62V47" ${s} stroke-dasharray="3 5"/>` +
        `<path d="M19 51.5L23.5 46.500L28 51.5" ${s}/>`
      );
    case 'chain':
      return (
        `<rect x="63" y="15" width="22" height="22" rx="5" ${softFill} ${s}/>` +
        `<rect x="39" y="39" width="22" height="22" rx="5" fill="${solid}" ${s}/>` +
        `<rect x="15" y="63" width="22" height="22" rx="5" ${softFill} ${s}/>` +
        `<path d="M63 37L61 39M39 61L37 63" ${s}/>` +
        `<circle cx="26" cy="26" r="2.2" fill="${solid}"/><circle cx="74" cy="74" r="2.2" fill="${solid}"/>`
      );
    case 'play':
      return (
        `<path d="M27 36h11v9h9v11h-9v9h-11v-9h-9v-11h9z" ${softFill} ${s}/>` +
        `<circle cx="67" cy="40" r="6.5" ${s}/>` +
        `<circle cx="78" cy="57" r="6.5" fill="${solid}" ${s}/>` +
        `<path d="M44 80h9M61 80h9" ${s}/>`
      );
    default:
      return '';
  }
}

/**
 * One plate. Returns { base, lit }.
 * base: the plate in neutral colours. lit: an accent overlay, to fade in on top.
 */
export function plate(doc, { cx, cy, a, b, t, kind, strokeWidth = 1, markWidth = 1.3, baseMarks = true }) {
  const th = doc.theme;
  const p = th.plate;
  const ids = plateDefs(doc);
  const m = faceMatrix(cx, cy, a, b);
  const mLow = faceMatrix(cx, cy + t, a, b);
  const ax = a * (1 - 0.00586 * RADIUS); // leftmost point of the rounded face
  const edge = `stroke="${p.stroke}" stroke-width="${strokeWidth}"`;

  const base =
    `<g class="ns">` +
    `<rect width="100" height="100" rx="${RADIUS}" transform="${mLow}" fill="url(#${ids.sideP})" ${edge}/>` +
    `<rect x="${n(cx - ax)}" y="${n(cy)}" width="${n(ax * 2)}" height="${n(t)}" fill="url(#${ids.sideR})"/>` +
    `<path d="M${n(cx - ax)} ${n(cy)}v${n(t)}M${n(cx + ax)} ${n(cy)}v${n(t)}" ${edge}/>` +
    `<rect width="100" height="100" rx="${RADIUS}" transform="${m}" fill="url(#${ids.top})" ${edge}/>` +
    (baseMarks ? `<g transform="${m}">${marks(kind, { line: p.mark, soft: p.mark, solid: p.mark, softO: 0.16, width: markWidth })}</g>` : '') +
    `</g>`;

  const lit =
    `<g class="ns">` +
    `<rect width="100" height="100" rx="${RADIUS}" transform="${m}" fill="${th.accent}" fill-opacity="${th.id === 'dark' ? 0.13 : 0.07}" stroke="${th.accent}" stroke-width="${strokeWidth + 0.25}"/>` +
    `<g transform="${m}">${marks(kind, { line: th.accent, soft: th.accent, solid: th.accent, softO: th.softO + 0.08, width: markWidth })}</g>` +
    `</g>`;

  return { base, lit };
}
