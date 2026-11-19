// Two cards with live numbers.
// One shows contributions per week. The other shows languages and the latest pushes.
// Every number comes from data/github.json.

import { Doc, n, measure, truncate } from './doc.mjs';
import { frame, hair, label, labelWidth, statusDot } from './parts.mjs';
import { GUTTER, CARD_W } from './theme.mjs';

const H = 300;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthOf = (iso) => Number(iso.slice(5, 7)) - 1;
const shortDate = (iso) => `${MONTHS[monthOf(iso)]} ${Number(iso.slice(8, 10))}`;

function setup(theme, title) {
  const W = CARD_W;
  const doc = new Doc({ w: W, h: H, theme, title });
  const g = GUTTER;
  const box = { g, w: W - g * 2, h: H - g * 2, left: g + 26, right: W - g - 26 };
  return { doc, box, body: frame(doc, { x: g, y: g, w: box.w, h: box.h, r: 16 }) };
}

/** Contributions per week, as bars. The newest week is in the accent colour. */
export function activityWeeks(theme, cfg, data) {
  const th = theme;
  const total = data.contributions.total;
  const weeks = data.contributions.weeks.slice(-cfg.activity.weeks);
  const best = Math.max(1, ...weeks.map((wk) => wk.count));
  const totalText = total.toLocaleString('en-US');
  const s = setup(theme, `${totalText} contributions in the last year. Best week of the last ${weeks.length}: ${best}.`);
  const { doc } = s;
  const { g, h, left, right } = s.box;
  let { body } = s;

  // the headline number
  const big = { font: 'sans-800', size: 50, tracking: -0.035 };
  body += doc.text(totalText, { ...big, x: left - 2, y: g + 76, fill: th.ink });
  const tw = measure(totalText, big.font, big.size, big);
  body += doc.text('contributions', { x: left + tw + 10, y: g + 57, font: 'sans-500', size: 13, fill: th.text });
  body += doc.text('in the last year', { x: left + tw + 10, y: g + 75, font: 'sans-400', size: 13, fill: th.muted });

  body += label(doc, `Last ${weeks.length} weeks`, { x: right, y: g + 43, anchor: 'end' });
  const bestW = labelWidth(String(best), { font: 'mono-700' });
  body += label(doc, String(best), { x: right, y: g + 60, anchor: 'end', fill: th.text, font: 'mono-700' });
  body += label(doc, 'Best week', { x: right - bestW - 8, y: g + 60, anchor: 'end' });

  // the bars
  const base = g + h - 48;
  const maxH = 112;
  const slot = (right - left) / weeks.length;
  const barW = Math.min(18, Math.round(slot * 0.62 * 10) / 10);
  let bars = '';
  let months = '';
  // a month gets a label where it starts, unless the next month starts right after it
  const starts = weeks.map((wk, i) => ({ i, month: monthOf(wk.start) })).filter((m, k, all) => k === 0 || m.month !== all[k - 1].month);
  const labelled = new Map();
  starts.forEach((m, k) => {
    const next = starts[k + 1];
    if ((!next || next.i - m.i >= 2) && m.i <= weeks.length - 2) labelled.set(m.i, MONTHS[m.month]);
  });
  weeks.forEach((wk, i) => {
    const bx = left + i * slot + (slot - barW) / 2;
    const isLast = i === weeks.length - 1;
    if (labelled.has(i)) months += label(doc, labelled.get(i), { x: bx, y: base + 20, size: 8.4 });
    if (wk.count === 0) {
      bars += `<rect x="${n(bx)}" y="${n(base - 2)}" width="${n(barW)}" height="2" rx="1" fill="${th.ink}" fill-opacity=".2"/>`;
      return;
    }
    const bh = Math.max(4, (wk.count / best) * maxH);
    const o = 0.2 + 0.42 * (i / Math.max(1, weeks.length - 1));
    bars += `<rect x="${n(bx)}" y="${n(base - bh)}" width="${n(barW)}" height="${n(bh)}" rx="${n(Math.min(3, barW / 2))}" fill="${isLast ? th.accent : th.ink}"${isLast ? '' : ` fill-opacity="${n(o)}"`}/>`;
    if (isLast) {
      const cy = base - bh - 10;
      bars += statusDot(doc, bx + barW / 2, cy, 2.6);
    } else if (wk.count === best) {
      bars += doc.text(String(wk.count), { x: bx + barW / 2, y: base - bh - 6, anchor: 'middle', font: 'mono-700', size: 8.4, fill: th.text });
    }
  });
  body += bars + hair(doc, left, base + 0.5, right, 0.06) + months;

  return doc.render(body);
}

/** Languages across the public repos, and the repos pushed most recently. */
export function activityRepos(theme, cfg, data) {
  const th = theme;
  const recent = data.recent.slice(0, cfg.activity.recent);
  const s = setup(
    theme,
    `Most used languages: ${data.languages.slice(0, 4).map((l) => l.name).join(', ')}. Latest pushes: ${recent.map((r) => r.name).join(', ')}.`,
  );
  const { doc } = s;
  const { g, left, right } = s.box;
  const span = right - left;
  let { body } = s;

  // languages
  const counted = data.languages.reduce((sum, l) => sum + l.repos, 0) || 1;
  const top = data.languages.slice(0, cfg.activity.languages);
  const rest = counted - top.reduce((sum, l) => sum + l.repos, 0);
  const parts = top.map((l) => ({ name: l.name, repos: l.repos }));
  if (rest > 0) parts.push({ name: 'Other', repos: rest });
  const shades = [1, 0.62, 0.42, 0.28, 0.18, 0.1];
  const paint = (i) => (i === 0 ? `fill="${th.accent}"` : `fill="${th.ink}" fill-opacity="${shades[Math.min(i, shades.length - 1)]}"`);

  const headY = g + 42;
  body += label(doc, 'Languages', { x: left, y: headY });
  body += label(doc, `${data.languages.length} in ${data.countedRepos} repos`, { x: right, y: headY, anchor: 'end' });

  const barY = headY + 13;
  const gap = 2.5;
  const usable = span - gap * (parts.length - 1);
  const clip = doc.uid('lb');
  doc.def(`<clipPath id="${clip}"><rect x="${n(left)}" y="${n(barY)}" width="${n(span)}" height="10" rx="5"/></clipPath>`);
  let segs = '';
  let sx = left;
  parts.forEach((part, i) => {
    const sw = (part.repos / counted) * usable;
    segs += `<rect x="${n(sx)}" y="${n(barY)}" width="${n(sw)}" height="10" ${paint(i)}/>`;
    sx += sw + gap;
  });
  body += `<g clip-path="url(#${clip})">${segs}</g>`;

  const cellW = span / 3;
  parts.forEach((part, i) => {
    const lx = left + (i % 3) * cellW;
    const ly = barY + 40 + Math.floor(i / 3) * 23;
    const pct = `${Math.round((part.repos / counted) * 100)}%`;
    const nameText = truncate(part.name, 'sans-500', 12.5, cellW - 48);
    body += `<rect x="${n(lx)}" y="${n(ly - 8.5)}" width="8" height="8" rx="2.5" ${paint(i)}/>`;
    body += doc.text(nameText, { x: lx + 14, y: ly, font: 'sans-500', size: 12.5, fill: th.text });
    body += doc.text(pct, { x: lx + 14 + measure(nameText, 'sans-500', 12.5) + 6, y: ly, font: 'mono-500', size: 9, fill: th.muted });
  });

  // latest pushes
  const splitY = barY + 84.5;
  body += hair(doc, left, splitY, right);
  const pushY = splitY + 28;
  body += label(doc, 'Latest pushes', { x: left, y: pushY });
  recent.forEach((repo, i) => {
    const ry = pushY + 26 + i * 24;
    body += doc.text(truncate(repo.name, 'sans-600', 12.75, span - 150), { x: left, y: ry, font: 'sans-600', size: 12.75, fill: th.ink });
    body += label(doc, shortDate(repo.pushedAt), { x: right, y: ry, anchor: 'end', fill: th.muted });
    if (repo.language) body += label(doc, repo.language, { x: right - 58, y: ry, anchor: 'end', tracking: 0.08 });
    if (i < recent.length - 1) body += hair(doc, left, ry + 8.5, right, -0.05);
  });

  return doc.render(body);
}
