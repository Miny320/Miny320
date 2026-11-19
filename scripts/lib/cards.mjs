// Project cards.
// The featured project gets two cards: its story, and a drawing of how it works.
// Every other project gets one card with a small drawing on top.
// All cards share one width, so two sit side by side on a wide screen
// and they stack on a phone.

import { Doc, n, measure } from './doc.mjs';
import { frame, hair, techLine, label, labelWidth, live, arrow } from './parts.mjs';
import { vignettes } from './vignettes.mjs';
import { GUTTER, CARD_W } from './theme.mjs';

const FEATURE_H = 316;
const CARD_H = 268;

export function describe(p) {
  return `${p.name}, ${p.kind.toLowerCase()}. ${p.tagline ? `${p.tagline} ` : ''}${p.text} Built with ${p.tech.join(', ')}.`;
}

function dotGrid(doc) {
  const th = doc.theme;
  const id = doc.uid('dt');
  doc.def(
    `<pattern id="${id}" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r=".9" fill="${th.ink}" fill-opacity="${th.id === 'dark' ? 0.15 : 0.19}"/></pattern>`,
  );
  return id;
}

/** Featured project, card one: the name, the promise, the details. */
export function featureText(theme, p) {
  const W = CARD_W;
  const H = FEATURE_H;
  const th = theme;
  const doc = new Doc({ w: W, h: H, theme, title: describe(p) });
  const g = GUTTER;
  const w = W - g * 2;
  const h = H - g * 2;
  const left = g + 26;
  const right = W - g - 26;
  const textW = right - left;

  let body = frame(doc, { x: g, y: g, w, h, r: 16 });

  const eyebrowY = g + 42;
  const strong = { font: 'mono-700', tracking: 0.14 };
  body += label(doc, 'Featured', { ...strong, x: left, y: eyebrowY, fill: th.accentText });
  const fw = labelWidth('Featured', strong);
  body += `<path d="M${n(left + fw + 14)} ${eyebrowY - 8}l-4 9.5" stroke="${th.faint}" stroke-width="1.1" stroke-linecap="round"/>`;
  body += label(doc, p.kind, { x: left + fw + 22, y: eyebrowY, fill: th.muted });
  if (p.live) body += live(doc, { x: right, y: eyebrowY, anchor: 'end' });

  const nameY = g + 99;
  const name = { font: 'sans-800', size: 46, tracking: -0.03 };
  body += doc.text(p.name, { ...name, x: left - 2, y: nameY, fill: th.ink });
  body += arrow(left + measure(p.name, name.font, name.size, name) + 10, nameY - 30, 11, th.faint, 1.6);

  const tagY = nameY + 37;
  const tag = doc.paragraph(p.tagline, { x: left, y: tagY, width: textW, lineHeight: 28, maxLines: 2, font: 'serif-400i', size: 23.5, fill: th.text });
  body += tag.markup;
  body += doc.paragraph(p.text, {
    x: left,
    y: tagY + tag.lines * 28 + 4,
    width: textW,
    lineHeight: 19,
    maxLines: 3,
    font: 'sans-400',
    size: 13,
    fill: th.muted,
  }).markup;

  const techY = g + h - 22;
  body += hair(doc, left, techY - 22.5, right);
  body += techLine(doc, p.tech, { x: left, y: techY, width: textW });

  return doc.render(body);
}

/** Featured project, card two: a drawing of the product at work. */
export function featureArt(theme, p) {
  const W = CARD_W;
  const H = FEATURE_H;
  const th = theme;
  const doc = new Doc({ w: W, h: H, theme, title: `${p.name}. ${p.figure}` });
  const g = GUTTER;
  const w = W - g * 2;
  const h = H - g * 2;

  const capH = 34; // the caption strip at the bottom
  const clip = doc.uid('cv');
  const dots = dotGrid(doc);
  doc.def(`<clipPath id="${clip}"><rect x="${g + 1}" y="${g + 1}" width="${w - 2}" height="${h - 2}" rx="15"/></clipPath>`);
  const art = vignettes[p.art](doc);

  let body =
    frame(doc, { x: g, y: g, w, h, r: 16 }) +
    `<g clip-path="url(#${clip})">` +
    `<rect x="${g}" y="${g}" width="${w}" height="${h - capH}" fill="${th.card}" fill-opacity="${th.card2O}"/>` +
    `<rect x="${g}" y="${g}" width="${w}" height="${h - capH}" fill="url(#${dots})"/>` +
    `</g>` +
    hair(doc, g + 1, g + h - capH + 0.5, g + w - 1) +
    `<g transform="translate(${n(g + (w - art.w) / 2)} ${n(g + (h - capH - art.h) / 2)})">${art.markup}</g>`;

  const capY = g + h - 13;
  const fig = { font: 'mono-700', size: 8.8, tracking: 0.12 };
  body += label(doc, 'Fig. 02', { ...fig, x: g + 26, y: capY, fill: th.muted });
  body += label(doc, p.figure, { x: g + 26 + labelWidth('Fig. 02', fig) + 12, y: capY });

  return doc.render(body);
}

/** A project card: a drawing on top, then the name, two lines and the tools. */
export function card(theme, p) {
  const W = CARD_W;
  const H = CARD_H;
  const th = theme;
  const doc = new Doc({ w: W, h: H, theme, title: describe(p) });
  const g = GUTTER;
  const w = W - g * 2;
  const h = H - g * 2;
  const left = g + 22;
  const right = W - g - 22;
  const coverH = 118;

  let body = frame(doc, { x: g, y: g, w, h, r: 16 });

  // cover: a tinted band with the drawing in the middle
  const clip = doc.uid('cv');
  const dots = dotGrid(doc);
  doc.def(`<clipPath id="${clip}"><rect x="${g + 1}" y="${g + 1}" width="${w - 2}" height="${h - 2}" rx="15"/></clipPath>`);
  const art = vignettes[p.art](doc);
  body +=
    `<g clip-path="url(#${clip})">` +
    `<rect x="${g}" y="${g}" width="${w}" height="${coverH}" fill="${th.card}" fill-opacity="${th.card2O}"/>` +
    `<rect x="${g}" y="${g}" width="${w}" height="${coverH}" fill="url(#${dots})"/>` +
    `</g>` +
    hair(doc, g + 1, g + coverH + 0.5, g + w - 1) +
    `<g transform="translate(${n(g + (w - art.w) / 2)} ${n(g + (coverH - art.h) / 2)})">${art.markup}</g>`;

  // text
  const kindY = g + coverH + 29;
  body += label(doc, p.kind, { x: left, y: kindY });
  if (p.live) body += live(doc, { x: right, y: kindY, anchor: 'end' });

  const nameY = kindY + 27;
  const name = { font: 'sans-700', size: 20.5, tracking: -0.015 };
  body += doc.text(p.name, { ...name, x: left - 1, y: nameY, fill: th.ink });
  body += arrow(left + measure(p.name, name.font, name.size, name) + 8, nameY - 12.5, 8, th.faint);

  body += doc.paragraph(p.text, { x: left, y: nameY + 23, width: right - left, lineHeight: 18.5, maxLines: 2, font: 'sans-400', size: 12.75, fill: th.muted }).markup;
  body += techLine(doc, p.tech, { x: left, y: g + h - 20, width: right - left });

  return doc.render(body);
}
