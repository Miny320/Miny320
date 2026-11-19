// Small animated drawings, one per project.
// Each function draws inside its own box and returns { w, h, markup }.
// The caller moves the box into place.

import { n } from './doc.mjs';

const bar = (x, y, w, fill, h = 6, o) =>
  `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${h}" rx="${h / 2}" fill="${fill}"${o != null ? ` fill-opacity="${o}"` : ''}/>`;

/** Citeline: an answer with numbered citations, each linked to an excerpt on the page. */
export function citeline(doc) {
  const th = doc.theme;
  const ui = th.ui;
  const soft = th.softO + 0.04;
  // Two citations take turns. Short fades run in a few steps, and nothing
  // changes while a citation is held, so the browser redraws very little.
  doc.css(`
    .ca,.ha{animation:on 9s steps(4,end) infinite}
    .la{animation:draw 9s steps(8,end) infinite}
    .cb,.hb{opacity:0;animation:on 9s steps(4,end) infinite;animation-delay:-4.5s}
    .lb{opacity:0;animation:draw 9s steps(8,end) infinite;animation-delay:-4.5s}
    @keyframes on{0%{opacity:0}5%,44%{opacity:1}49%,100%{opacity:0}}
    @keyframes draw{0%{stroke-dashoffset:1;opacity:1}7%,44%{stroke-dashoffset:0;opacity:1}49%{stroke-dashoffset:0;opacity:0}49.01%,100%{stroke-dashoffset:1;opacity:0}}
  `);

  const chip = (x, y, digit, cls) =>
    `<rect x="${x}" y="${y}" width="20" height="14" rx="5" fill="${th.accent}" fill-opacity="${soft}" stroke="${th.accent}" stroke-width="1.1"/>` +
    doc.text(digit, { x: x + 10, y: y + 10.3, anchor: 'middle', font: 'mono-700', size: 8.6, fill: th.accentText }) +
    `<g class="${cls}"><rect x="${x}" y="${y}" width="20" height="14" rx="5" fill="${th.accent}" stroke="${th.accent}" stroke-width="1.1"/>` +
    doc.text(digit, { x: x + 10, y: y + 10.3, anchor: 'middle', font: 'mono-700', size: 8.6, fill: th.onAccent }) +
    `</g>`;

  // the chat window
  let chat =
    `<rect x="16.5" y="18.5" width="206" height="250" rx="11" fill="${ui.bg}" stroke="${ui.stroke}"/>` +
    `<path d="M17 44.5H222" stroke="${ui.stroke}"/>` +
    `<circle cx="31" cy="31.5" r="2.5" fill="${ui.bar}"/><circle cx="40" cy="31.5" r="2.5" fill="${ui.bar}"/><circle cx="49" cy="31.5" r="2.5" fill="${ui.bar}"/>` +
    bar(152, 28, 56, ui.bar2, 7) +
    // the question
    `<rect x="92" y="58" width="116" height="26" rx="13" fill="${th.accent}" fill-opacity="${soft}"/>` +
    bar(106, 68, 88, th.accent, 6, 0.8) +
    // the answer
    `<circle cx="34" cy="109" r="8" fill="${th.accent}" fill-opacity="${soft}"/>` +
    `<path d="M34 103.500C34.6 107.4 35.6 108.4 39.5 109C35.6 109.6 34.6 110.6 34 114.500C33.4 110.6 32.4 109.6 28.5 109C32.4 108.4 33.4 107.4 34 103.500Z" fill="${th.accent}"/>` +
    bar(50, 104, 150, ui.bar) +
    bar(50, 118, 96, ui.bar) +
    chip(152, 114, '1', 'ca') +
    bar(50, 134, 140, ui.bar) +
    bar(50, 148, 64, ui.bar) +
    chip(120, 144, '2', 'cb') +
    bar(50, 172, 128, ui.bar) +
    bar(50, 186, 92, ui.bar) +
    `<rect x="147" y="184" width="2" height="10" rx="1" fill="${th.accent}"/>` +
    // the input
    `<rect x="30.5" y="226.5" width="178" height="28" rx="14" fill="${ui.bar2}" stroke="${ui.stroke}"/>` +
    bar(45, 237.5, 70, ui.bar) +
    `<circle cx="194" cy="240.5" r="9" fill="${th.accent}"/>` +
    `<path d="M194 244.500V236.500M190.5 240L194 236.500L197.5 240" stroke="${th.onAccent}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`;

  // the page of the document
  const rows = [78, 62, 74, 70, 80, 54, 76, 66, 72, 78, 60, 44];
  let page =
    `<rect x="250.5" y="38.5" width="104" height="212" rx="8" fill="${ui.bg}" stroke="${ui.stroke}"/>` +
    doc.text('PAGE 12', { x: 262, y: 56.5, font: 'mono-500', size: 7.2, tracking: 0.14, fill: th.faint }) +
    `<path d="M251 65.500H354" stroke="${ui.stroke}"/>`;
  rows.forEach((w, k) => {
    page += bar(262, 77 + k * 13.5, w, ui.bar, 5);
  });
  const excerpt = (k, cls) => {
    const y = 77 + k * 13.5 - 6;
    return (
      `<g class="${cls}">` +
      `<rect x="256" y="${n(y)}" width="92" height="30.5" rx="4" fill="${th.accent}" fill-opacity="${soft}"/>` +
      `<rect x="256" y="${n(y)}" width="2.5" height="30.5" rx="1.25" fill="${th.accent}"/>` +
      bar(262, 77 + k * 13.5, rows[k], th.accent, 5, 0.85) +
      bar(262, 77 + (k + 1) * 13.5, rows[k + 1], th.accent, 5, 0.85) +
      `<circle cx="256" cy="${n(y + 15.25)}" r="3" fill="${th.accent}"/>` +
      `</g>`
    );
  };
  page += excerpt(2, 'ha') + excerpt(8, 'hb');
  const y1 = 77 + 2 * 13.5 - 6 + 15.25;
  const y2 = 77 + 8 * 13.5 - 6 + 15.25;

  const link = (d, cls) =>
    `<path class="${cls}" d="${d}" pathLength="1" stroke-dasharray="1" stroke="${th.accent}" stroke-width="1.5" stroke-linecap="round"/>`;
  const links =
    link(`M172 121C214 121 214 ${n(y1)} 256 ${n(y1)}`, 'la') + link(`M140 151C204 151 196 ${n(y2)} 256 ${n(y2)}`, 'lb');

  return { w: 370, h: 286, markup: chat + page + links };
}

/** Guardian Care: the sun, a day of solar production, a battery filling up. */
export function energy(doc) {
  const th = doc.theme;
  const ui = th.ui;
  const area = doc.uid('ar');
  doc.def(
    `<linearGradient id="${area}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${th.accent}" stop-opacity="${th.id === 'dark' ? 0.4 : 0.28}"/><stop offset="1" stop-color="${th.accent}" stop-opacity="0"/></linearGradient>`,
  );
  doc.css(`
    .scan{transform:translateX(88px);animation:scan 8s steps(8,end) infinite}
    @keyframes scan{from{transform:translateX(0)}to{transform:translateX(176px)}}
    .b2{animation:b2 4s steps(1,end) infinite}.b3{animation:b3 4s steps(1,end) infinite}
    @keyframes b2{0%{opacity:.2}25%{opacity:1}100%{opacity:1}}
    @keyframes b3{0%{opacity:.2}50%{opacity:1}100%{opacity:1}}
  `);

  let rays = '';
  for (let k = 0; k < 8; k++) {
    const ang = (k * Math.PI) / 4;
    rays += `M${n(22 + 13 * Math.cos(ang))} ${n(45 + 13 * Math.sin(ang))}L${n(22 + 17.5 * Math.cos(ang))} ${n(45 + 17.5 * Math.sin(ang))}`;
  }
  const sun =
    `<circle cx="22" cy="45" r="8" fill="${th.accent}" fill-opacity="${th.softO + 0.06}" stroke="${th.accent}" stroke-width="1.4"/>` +
    `<path d="${rays}" stroke="${th.accent}" stroke-width="1.4" stroke-linecap="round"/>`;

  const curve = 'M60 74C100 74 112 18 148 18S196 74 236 74';
  let ticks = '';
  for (const x of [60, 104, 148, 192, 236]) ticks += `M${x} 74.500V78.5`;
  const chart =
    `<path d="${curve}Z" fill="url(#${area})"/>` +
    `<path d="M60 58C76 50 88 64 104 56S128 44 148 52S180 66 196 50S224 56 236 50" stroke="${ui.stroke}" stroke-width="1.3" stroke-linecap="round" stroke-dasharray="1 4.5"/>` +
    `<path d="${curve}" stroke="${th.accent}" stroke-width="1.7" stroke-linecap="round"/>` +
    `<path d="M56 74.500H240${ticks}" stroke="${ui.stroke}"/>` +
    `<g class="scan"><path d="M60 13V74" stroke="${th.accent}" stroke-opacity=".75"/><circle cx="60" cy="12" r="2.6" fill="${th.accent}"/></g>`;

  const battery =
    `<rect x="268" y="20" width="12" height="6" rx="2.5" fill="${ui.stroke}"/>` +
    `<rect x="261.5" y="25.5" width="25" height="48" rx="6" fill="${ui.bg}" stroke="${ui.stroke}"/>` +
    `<rect x="265.5" y="58.5" width="17" height="11" rx="2.5" fill="${th.accent}"/>` +
    `<rect class="b2" x="265.5" y="44" width="17" height="11" rx="2.5" fill="${th.accent}"/>` +
    `<rect class="b3" x="265.5" y="29.5" width="17" height="11" rx="2.5" fill="${th.accent}"/>`;

  return { w: 300, h: 90, markup: sun + chart + battery };
}

/** Neve Atelier: the size grid, a moving selection, and the 30% deposit. */
export function sizes(doc) {
  const th = doc.theme;
  const ui = th.ui;
  const pitch = 43.2;
  const order = [0, 1, 2, 3, 4, 5, 4, 3, 2, 1];
  const frames = order.map((pos, k) => `${k * 10}%{transform:translateX(${n(pos * pitch)}px)}`).join('');
  doc.css(`.ring{animation:ring 10s steps(1,end) infinite}@keyframes ring{${frames}100%{transform:translateX(0)}}`);

  const stock = [34, 20, 28, 10, 34, 16];
  let grid = '';
  [34, 36, 38, 40, 42, 44].forEach((size, i) => {
    const x = i * pitch;
    grid +=
      `<rect x="${n(x + 0.5)}" y="4.5" width="33" height="33" rx="8" fill="${ui.bg}" stroke="${ui.stroke}"/>` +
      doc.text(String(size), { x: x + 17, y: 25, anchor: 'middle', font: 'mono-500', size: 10.5, fill: th.text }) +
      bar(x, 44, 34, ui.bar2, 3) +
      bar(x, 44, stock[i], ui.bar, 3);
  });
  const ring = `<rect class="ring" x="-2" y="2" width="38" height="38" rx="10" fill="${th.accent}" fill-opacity="${th.softO}" stroke="${th.accent}" stroke-width="1.6"/>`;

  const deposit =
    doc.text('30% DEPOSIT', { x: 0, y: 79, font: 'mono-700', size: 8.6, tracking: 0.12, fill: th.accentText }) +
    bar(92, 72.5, 158, ui.bar, 6, 0.7) +
    bar(92, 72.5, 158 * 0.3, th.accent, 6);

  return { w: 250, h: 84, markup: grid + ring + deposit };
}

/** Private Winter Sale: a countdown. The seconds really count down. */
export function countdown(doc) {
  const th = doc.theme;
  const ui = th.ui;
  const boxW = 50;
  const pitch = 70.67;
  const cell = 46;
  doc.css(`
    .s1{animation:s1 10s steps(10) infinite}@keyframes s1{to{transform:translateY(-${cell * 10}px)}}
    .s10{animation:s10 60s steps(6) infinite}@keyframes s10{to{transform:translateY(-${cell * 6}px)}}
    .col{animation:col 2s steps(1,end) infinite}@keyframes col{50%{opacity:.3}}
  `);
  const digit = (d, cxp, y) => doc.text(String(d), { x: cxp, y, anchor: 'middle', font: 'sans-700', size: 23, fill: th.ink });
  const values = ['02', '14', '36'];
  const names = ['Days', 'Hrs', 'Min', 'Sec'];
  let out = '';
  names.forEach((name, i) => {
    const x = i * pitch;
    const mid = x + boxW / 2;
    out += `<rect x="${n(x + 0.5)}" y=".5" width="${boxW - 1}" height="45" rx="9" fill="${ui.bg}" stroke="${ui.stroke}"/>`;
    if (values[i]) out += digit(values[i][0], mid - 7.4, 31) + digit(values[i][1], mid + 7.4, 31);
    out += doc.text(name.toUpperCase(), { x: mid, y: 62, anchor: 'middle', font: 'mono-500', size: 7.6, tracking: 0.14, fill: th.faint });
    if (i < 3) {
      const cxp = x + boxW + (pitch - boxW) / 2;
      out += `<g class="col"><circle cx="${n(cxp)}" cy="17" r="1.9" fill="${th.muted}"/><circle cx="${n(cxp)}" cy="29" r="1.9" fill="${th.muted}"/></g>`;
    }
  });
  // the seconds: two strips of digits behind a window
  const sx = 3 * pitch;
  const mid = sx + boxW / 2;
  const clip = doc.uid('cd');
  doc.def(`<clipPath id="${clip}"><rect x="${n(sx + 2)}" y="2" width="${boxW - 4}" height="42" rx="7"/></clipPath>`);
  let units = '';
  for (let k = 0; k < 10; k++) units += digit(9 - k, mid + 7.4, 31 + k * cell);
  let tens = '';
  for (let k = 0; k < 6; k++) tens += digit(5 - k, mid - 7.4, 31 + k * cell);
  out += `<g clip-path="url(#${clip})"><g class="s10">${tens}</g><g class="s1">${units}</g></g>`;
  // a thin accent line under the seconds box
  out += `<rect x="${n(sx + 12)}" y="70" width="${boxW - 24}" height="2.5" rx="1.25" fill="${th.accent}"/>`;

  return { w: 262, h: 74, markup: out };
}

/** Claw Machine: the claw fetches the orange ball and drops it at the chute. */
export function claw(doc) {
  const th = doc.theme;
  const ui = th.ui;
  const travel = 76;
  const drop = 16;
  // The claw moves like a real arcade machine: in even steps, one axis at a time.
  // The claw and the ball use the same steps, so the ball stays in the grip.
  const loop = 16; // seconds for one full round, with a long pause at the end
  const at = (seconds) => `${n((seconds / loop) * 100)}%`;
  const steps = (count) => `animation-timing-function:steps(${count},end)`;
  const across = steps(24);
  const updown = steps(12);
  const atHome = 'transform:translateX(0)';
  const atBall = `transform:translateX(${travel}px)`;
  const raised = 'transform:translateY(0)';
  const lowered = `transform:translateY(${drop}px)`;
  const ballAt = (x, y, o = 1) => `transform:translate(${x}px,${y}px);opacity:${o}`;
  // The round, in seconds: go right, lower, grab, lift, come back, let go.
  const go = [0.7, 2.1];
  const lower = [2.3, 3.1];
  const lift = [3.6, 4.4];
  const back = [5, 6.4];
  const fall = [6.7, 7.2];
  doc.css(`
    .cx{animation:cx ${loop}s linear infinite}
    @keyframes cx{0%{${atHome}}${at(go[0])}{${atHome};${across}}${at(go[1])}{${atBall}}${at(back[0])}{${atBall};${across}}${at(back[1])},100%{${atHome}}}
    .hy{animation:hy ${loop}s linear infinite}
    @keyframes hy{0%{${raised}}${at(lower[0])}{${raised};${updown}}${at(lower[1])}{${lowered}}${at(lift[0])}{${lowered};${updown}}${at(lift[1])},100%{${raised}}}
    .bl{animation:bl ${loop}s linear infinite}
    @keyframes bl{0%{${ballAt(0, 0)}}${at(lift[0])}{${ballAt(0, 0)};${updown}}${at(lift[1])}{${ballAt(0, -drop)}}${at(back[0])}{${ballAt(0, -drop)};${across}}${at(back[1])}{${ballAt(-travel, -drop)}}${at(fall[0])}{${ballAt(-travel, -drop)};${steps(8)}}${at(fall[1])}{${ballAt(-travel, 0)};${steps(4)}}${at(fall[1] + 0.35)}{${ballAt(-travel, 0, 0)};${steps(1)}}${at(fall[1] + 0.45)}{${ballAt(0, 0, 0)}}${at(8.2)}{${ballAt(0, 0, 0)};${steps(4)}}${at(8.6)},100%{${ballAt(0, 0)}}}
    .btn{animation:btn ${loop}s steps(1) infinite}
    @keyframes btn{0%{opacity:.35}${at(lower[0])}{opacity:1}${at(lift[0])}{opacity:.35}100%{opacity:.35}}
  `);
  const clip = doc.uid('cl');
  doc.def(`<clipPath id="${clip}"><rect x="9" y="17" width="132" height="54"/></clipPath>`);
  const home = 28;
  const ballX = home + travel;
  const pile = [
    [52, 64.5], [66, 64.5], [80, 64.5], [124, 64.5], [59, 53.5], [73, 53.5],
  ]
    .map(([x, y], k) => `<circle cx="${x}" cy="${y}" r="6.5" fill="${k % 2 ? ui.bar : ui.bar2}" stroke="${ui.stroke}"/>`)
    .join('');

  const cabinet =
    `<rect x=".5" y=".5" width="149" height="101" rx="11" fill="${ui.bg}" stroke="${ui.stroke}"/>` +
    `<rect x="9.5" y="9.5" width="131" height="62" rx="5" fill="${th.card}" fill-opacity="${th.card2O}" stroke="${ui.stroke}"/>` +
    `<path d="M14 18H136" stroke="${ui.bar}" stroke-width="2" stroke-linecap="round"/>` +
    // chute, joystick, button
    `<rect x="16" y="79" width="24" height="15" rx="4" fill="${ui.bar2}" stroke="${ui.stroke}"/>` +
    `<path d="M84 89V82" stroke="${ui.stroke}" stroke-width="2" stroke-linecap="round"/><circle cx="84" cy="80.5" r="3.2" fill="${ui.bar}"/><rect x="77" y="88" width="14" height="4" rx="2" fill="${ui.bar}"/>` +
    `<circle cx="121" cy="86.5" r="6.5" fill="${th.accent}" fill-opacity=".25"/><circle class="btn" cx="121" cy="86.5" r="6.5" fill="${th.accent}"/>`;

  const ball = `<circle class="bl" cx="${ballX}" cy="64.5" r="6.5" fill="${th.accent}"/>`;
  const head =
    `<g clip-path="url(#${clip})"><g class="hy">` +
    `<path d="M${home} -40V31" stroke="${th.muted}" stroke-width="1.4"/>` +
    `<circle cx="${home}" cy="32" r="2.8" fill="${th.muted}"/>` +
    `<path d="M${home - 2} 33.500Q${home - 10} 37 ${home - 7.5} 46M${home + 2} 33.500Q${home + 10} 37 ${home + 7.5} 46" stroke="${th.ink}" stroke-width="1.6" stroke-linecap="round"/>` +
    `</g></g>`;
  const trolley = `<rect x="${home - 8}" y="13.5" width="16" height="8" rx="2.5" fill="${th.muted}"/>`;

  return { w: 150, h: 102, markup: cabinet + pile + ball + `<g class="cx">${head}${trolley}</g>` };
}

export const vignettes = { citeline, energy, sizes, countdown, claw };
