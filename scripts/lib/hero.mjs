// The top of the page, drawn as two images that sit side by side.
//
// Left: the headline and three numbers. It is still after a short intro.
// Right: the stack, one plate per layer. Each plate slides out in turn,
// like a tray, and shows what that layer is.
//
// Two images instead of one, for two reasons. The browser redraws a whole image
// on every animation frame, so the moving part should be small. And on a phone
// the two images stack, which keeps the headline large.

import { Doc, n, measure, fit } from './doc.mjs';
import { plate } from './iso.mjs';
import { statusDot } from './parts.mjs';
import { COLUMN } from './theme.mjs';

export const HERO_TITLE_W = 470;
export const HERO_STACK_W = COLUMN - HERO_TITLE_W;
const H = 440;

const pad2 = (v) => String(v).padStart(2, '0');

// Both images are drawn in one shared space, COLUMN wide.
// The stack image shows the part to the right of HERO_TITLE_W.
function geometry(cfg) {
  const count = cfg.layers.length;
  const a = 112;
  const b = 56;
  const t = 10;
  const step = 33;
  const cx = HERO_TITLE_W + 124;
  const cy0 = 127;
  return {
    count,
    a,
    b,
    t,
    step,
    cx,
    cy0,
    slideX: Math.round(a * 0.82),
    slideY: Math.round(b * 0.82),
    // The glow and the dots sit in the middle of the stack image and fade out
    // before its edges. So nothing is cut off when the two images stack on a phone.
    artX: HERO_TITLE_W + HERO_STACK_W / 2 + 4,
    artY: cy0 + (step * (count - 1)) / 2 + 30,
    reach: HERO_STACK_W / 2 - 4,
  };
}

/** The glow and the fading dot grid behind the stack. */
function backdrop(doc, geo) {
  const th = doc.theme;
  const glow = doc.uid('gl');
  doc.def(
    `<radialGradient id="${glow}" gradientUnits="userSpaceOnUse" cx="${geo.artX}" cy="${geo.artY}" r="${geo.reach}"><stop offset="0" stop-color="${th.accent}" stop-opacity="${th.glowO}"/><stop offset="1" stop-color="${th.accent}" stop-opacity="0"/></radialGradient>`,
  );
  let out = `<circle cx="${geo.artX}" cy="${geo.artY}" r="${geo.reach}" fill="url(#${glow})"/>`;
  // A grid of dots that fades out with distance. It is one small pattern,
  // painted as a disc and four rings of falling strength. That is far cheaper
  // to redraw than hundreds of single dots.
  const dots = doc.uid('dt');
  doc.def(`<pattern id="${dots}" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="11" cy="11" r="1" fill="${th.ink}"/></pattern>`);
  const dotO = th.id === 'dark' ? 0.2 : 0.24;
  const core = geo.reach * 0.3;
  const rings = 4;
  const band = (geo.reach - core) / rings;
  out += `<circle cx="${geo.artX}" cy="${geo.artY}" r="${n(core)}" fill="url(#${dots})" fill-opacity="${dotO}"/>`;
  for (let k = 0; k < rings; k++) {
    out += `<circle cx="${geo.artX}" cy="${geo.artY}" r="${n(core + (k + 0.5) * band)}" stroke="url(#${dots})" stroke-width="${n(band)}" stroke-opacity="${n(dotO * (1 - (k + 0.5) / rings))}"/>`;
  }
  return out;
}

/** Left image: who this is, the headline, three numbers. */
export function heroTitle(theme, cfg, data) {
  const W = HERO_TITLE_W;
  const th = theme;
  const since = new Date(data.createdAt).getUTCFullYear();
  const doc = new Doc({
    w: W,
    h: H,
    theme,
    title: `${cfg.headline.join(' ')} ${cfg.name}, ${cfg.role}. On GitHub since ${since}.`,
  });

  doc.css(`
    .ch{animation:rise .85s cubic-bezier(.2,.7,.2,1) backwards;animation-delay:calc(var(--k)*26ms + 80ms)}
    @keyframes rise{from{opacity:0;transform:translateY(var(--r))}}
    .fade{animation:fade 1.1s ease-out backwards}
    .f1{animation-delay:.1s}.f2{animation-delay:.7s}.f3{animation-delay:1s}
    @keyframes fade{from{opacity:0}}
  `);

  // crop marks on the outer corners
  const m = 12;
  let body = `<path class="fade f3" d="M.5 ${m}V.5H${m}M${m} ${H - 0.5}H.5V${H - m}" stroke="${th.ink}" stroke-opacity=".3"/>`;

  // who
  const x0 = 12;
  const eyeY = 100;
  const eye = { size: 10.5, tracking: 0.16 };
  let ex = x0 + 18;
  body += statusDot(doc, 15.5, 96.5, 3.5);
  let eyebrow = doc.text(cfg.name.toUpperCase(), { x: ex, y: eyeY, font: 'mono-700', fill: th.ink, ...eye });
  ex += measure(cfg.name.toUpperCase(), 'mono-700', eye.size, eye) + 12;
  eyebrow += `<path d="M${n(ex + 4)} ${eyeY - 9}l-5 11" stroke="${th.faint}" stroke-width="1.2" stroke-linecap="round"/>`;
  ex += 13;
  eyebrow += doc.text(cfg.role.toUpperCase(), { x: ex, y: eyeY, font: 'mono-500', fill: th.muted, ...eye });
  body += `<g class="fade f1">${eyebrow}</g>`;

  // headline
  const maxHead = 436;
  const [line1, line2] = cfg.headline;
  const s1 = fit(line1, 'sans-800', maxHead, 84, { tracking: -0.035 });
  body += doc.text(line1, { x: x0 - 3, y: 192, font: 'sans-800', size: s1, tracking: -0.035, fill: th.ink, rise: { start: 0, distance: 16 } });
  const s2 = fit(line2, 'serif-400i', maxHead, 106, { tracking: -0.012 });
  body += doc.text(line2, {
    x: x0 - 2,
    y: 280,
    font: 'serif-400i',
    size: s2,
    tracking: -0.012,
    ramp: [th.accent, th.accent2],
    rise: { start: line1.length, distance: 16 },
  });

  // three numbers
  const stats = [
    ['On GitHub since', String(since)],
    ['Public repos', String(data.publicRepos)],
    ['Contributions, last year', data.contributions.total.toLocaleString('en-US')],
  ];
  const lab = { font: 'mono-500', size: 9, tracking: 0.12 };
  let sx = x0;
  let statsMarkup = '';
  stats.forEach(([name, value], i) => {
    const lw = measure(name.toUpperCase(), lab.font, lab.size, lab);
    const vw = measure(value, 'sans-700', 30, { tracking: -0.02 });
    if (i > 0) statsMarkup += `<path d="M${n(sx - 16)} 329V374" stroke="${th.line}" stroke-opacity="${th.lineO + 0.06}"/>`;
    statsMarkup += doc.text(name.toUpperCase(), { x: sx, y: 338, fill: th.muted, ...lab });
    statsMarkup += doc.text(value, { x: sx - 1, y: 373, font: 'sans-700', size: 30, tracking: -0.02, fill: th.ink });
    sx += Math.max(lw, vw) + 32;
  });
  body += `<g class="fade f2">${statsMarkup}</g>`;

  return doc.render(body);
}

/** Right image: the stack. */
export function heroStack(theme, cfg) {
  const W = HERO_STACK_W;
  const th = theme;
  const layers = cfg.layers;
  const geo = geometry(cfg);
  const { count, a, b, t, step, cx, cy0, slideX, slideY } = geo;
  const doc = new Doc({
    w: W,
    h: H,
    theme,
    title: `A stack of ${count} layers: ${layers.map((l) => l.title).join(', ')}.`,
  });

  // One plate at a time: it slides out, rests so the caption can be read, slides back.
  // Between the moves nothing changes, so the browser has nothing to redraw.
  const move = 0.5; // seconds for one slide
  const rest = 2.1; // seconds a plate stays out
  const pitch = move + rest + move - 0.2; // the next plate starts just before this one is back
  const loop = count * pitch;
  const start = 1.6;
  const at = (seconds) => `${n((seconds / loop) * 100)}%`;
  const out = `translate(${slideX}px,${slideY}px)`;
  const cycle = `${n(loop)}s`;
  const delay = `animation-delay:calc(${start}s + var(--i)*${n(pitch)}s)`;
  doc.css(`
    .fade{animation:fade 1.1s ease-out 1s backwards}
    @keyframes fade{from{opacity:0}}
    .pin{animation:pin .9s cubic-bezier(.2,.7,.2,1) backwards;animation-delay:calc(.2s + var(--j)*70ms)}
    @keyframes pin{from{opacity:0;transform:translateY(-22px)}}
    .tray{animation:tray ${cycle} cubic-bezier(.65,0,.25,1) infinite backwards;${delay}}
    @keyframes tray{0%,${at(move + rest + move)},100%{transform:translate(0,0)}${at(move)},${at(move + rest)}{transform:${out}}}
    .lit{opacity:0;visibility:hidden;animation:lit ${cycle} ease infinite;${delay}}
    @keyframes lit{0%{opacity:0;visibility:visible}${at(move * 0.8)},${at(move + rest + move * 0.2)}{opacity:1;visibility:visible}${at(move + rest + move)}{opacity:0;visibility:visible}${at(move + rest + move + 0.02)},100%{opacity:0;visibility:hidden}}
    .cap{opacity:0;visibility:hidden;animation:cap ${cycle} ease infinite;${delay}}
    @keyframes cap{0%{opacity:0;transform:translateY(6px);visibility:visible}${at(move * 0.9)},${at(move + rest - 0.1)}{opacity:1;transform:translateY(0);visibility:visible}${at(move + rest + 0.3)}{opacity:0;transform:translateY(-5px);visibility:visible}${at(move + rest + 0.32)},100%{opacity:0;transform:translateY(-5px);visibility:hidden}}
  `);
  // The hidden captions and accent layers are not drawn at all, which keeps each frame cheap.
  // With motion switched off, show the first plate out, with its caption.
  doc.still(`.t0{transform:${out}}.t0 .lit,.c0{opacity:1;visibility:visible}`);

  let body = backdrop(doc, geo);

  // crop marks on the outer corners
  const m = 12;
  const right = COLUMN - 0.5;
  body += `<path class="fade" d="M${COLUMN - m} .5H${right}V${m}M${right} ${H - m}V${H - 0.5}H${COLUMN - m}" stroke="${th.ink}" stroke-opacity=".3"/>`;

  // the floor shadow and the plates, bottom plate first
  const floor = doc.uid('fs');
  doc.def(
    `<radialGradient id="${floor}"><stop offset="0" stop-color="${th.shadow}" stop-opacity="${th.shadowO}"/><stop offset=".55" stop-color="${th.shadow}" stop-opacity="${n(th.shadowO * 0.45)}"/><stop offset="1" stop-color="${th.shadow}" stop-opacity="0"/></radialGradient>`,
  );
  const floorY = cy0 + step * (count - 1) + b + t + 16;
  body += `<ellipse cx="${cx + 26}" cy="${floorY}" rx="${a * 1.4}" ry="40" fill="url(#${floor})"/>`;
  for (let i = count - 1; i >= 0; i--) {
    const p = plate(doc, { cx, cy: cy0 + i * step, a, b, t, kind: layers[i].art, baseMarks: i === 0 });
    body +=
      `<g class="pin" style="--j:${count - 1 - i}">` +
      `<g class="tray t${i}" style="--i:${i}">${p.base}<g class="lit">${p.lit}</g></g>` +
      `</g>`;
  }

  // one caption per plate, shown while its plate is out
  const capX = COLUMN - 12;
  layers.forEach((layer, i) => {
    body +=
      `<g class="cap c${i}" style="--i:${i}">` +
      doc.text(`${pad2(i + 1)} / ${pad2(count)}`, { x: capX, y: 36, anchor: 'end', font: 'mono-500', size: 10, tracking: 0.12, fill: th.accentText }) +
      doc.text(layer.title, { x: capX, y: 61, anchor: 'end', font: 'sans-700', size: 19, tracking: -0.01, fill: th.ink }) +
      doc.text(layer.tech.slice(0, 3).join(' · ').toUpperCase(), { x: capX, y: 80, anchor: 'end', font: 'mono-500', size: 9, tracking: 0.08, fill: th.muted }) +
      `</g>`;
  });

  // figure caption
  const figY = H - 14;
  const words = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const figText = `${words[count] || count} layers, one developer`.toUpperCase();
  const figW = measure(figText, 'mono-500', 9, { tracking: 0.12 });
  body +=
    `<g class="fade">` +
    doc.text(figText, { x: COLUMN - 14, y: figY, anchor: 'end', font: 'mono-500', size: 9, tracking: 0.12, fill: th.faint }) +
    doc.text('FIG. 01', { x: COLUMN - 14 - figW - 14, y: figY, anchor: 'end', font: 'mono-700', size: 9, tracking: 0.12, fill: th.muted }) +
    `</g>`;

  // everything above is drawn in the shared space, so shift it into this image
  return doc.render(`<g transform="translate(${-HERO_TITLE_W} 0)">${body}</g>`);
}
