// Writes README.md. The page is a list of pictures, plus a few lines of real text.
//
// Every picture has a dark and a light file. GitHub picks one with <picture>.
// Every picture has a fixed pixel width. On a wide screen the pieces of a row
// sit side by side. On a phone they stack and scale down to the screen.

import { esc } from './doc.mjs';
import { COLUMN, TILE_W, CARD_W } from './theme.mjs';
import { HERO_TITLE_W, HERO_STACK_W } from './hero.mjs';

const picture = (name, alt, width) =>
  `<picture>` +
  `<source media="(prefers-color-scheme: dark)" srcset="assets/${name}-dark.svg">` +
  `<source media="(prefers-color-scheme: light)" srcset="assets/${name}-light.svg">` +
  `<img src="assets/${name}-light.svg" alt="${esc(alt)}" width="${width}">` +
  `</picture>`;

const link = (href, inner) => (href ? `<a href="${esc(href)}">${inner}</a>` : inner);

export function readme(cfg, data) {
  const profile = `https://github.com/${cfg.login}`;
  const repos = `${profile}?tab=repositories`;
  const repo = (name) => `${profile}/${name}`;
  const since = new Date(data.createdAt).getUTCFullYear();
  const out = [];

  out.push(
    `<!--`,
    `  This file is written by "npm run build". Do not edit it by hand.`,
    `  The words live in profile.config.mjs. The drawing code lives in scripts/.`,
    `-->`,
    ``,
  );

  // The top: two pictures on one line, with no space between them, so they meet edge to edge.
  const titleAlt = `${cfg.headline.join(' ')} ${cfg.name}, ${cfg.role}. On GitHub since ${since}, with ${data.publicRepos} public repositories.`;
  const stackAlt = `A stack of ${cfg.layers.length} layers: ${cfg.layers.map((l) => l.title).join(', ')}.`;
  out.push(
    `<p align="center">`,
    link(repos, picture('hero-title', titleAlt, HERO_TITLE_W)) + link(repos, picture('hero-stack', stackAlt, HERO_STACK_W)),
    `</p>`,
    ``,
  );

  for (const line of cfg.intro) out.push(`<p align="center">${esc(line)}</p>`, ``);

  const heading = (name, alt) => out.push(`<p align="center">${picture(name, alt, COLUMN)}</p>`, ``);

  // 01 the stack
  heading('section-stack', 'What I build');
  out.push(`<p align="center">`);
  for (const layer of cfg.layers) {
    const alt = `${layer.title}. ${layer.text} Tools: ${layer.tech.join(', ')}.`;
    out.push(link(layer.link, picture(`layer-${layer.art}`, alt, TILE_W)));
  }
  out.push(`</p>`, ``);

  // 02 selected work
  const all = [cfg.featured, ...cfg.projects].filter(Boolean);
  const altFor = (p) => `${p.name}, ${p.kind.toLowerCase()}. ${p.tagline ? `${p.tagline} ` : ''}${p.text}`;
  heading('section-work', 'Selected work');
  out.push(`<p align="center">`);
  if (cfg.featured) {
    const f = cfg.featured;
    out.push(link(repo(f.repo), picture(`work-${f.repo}`, altFor(f), CARD_W)));
    out.push(link(f.live || repo(f.repo), picture(`work-${f.repo}-figure`, `${f.name}. ${f.figure}.`, CARD_W)));
  }
  for (const p of cfg.projects) out.push(link(repo(p.repo), picture(`work-${p.repo}`, altFor(p), CARD_W)));
  out.push(`</p>`, ``);

  const demos = all.filter((p) => p.live).map((p) => `<a href="${esc(p.live)}">${esc(p.name)}</a>`);
  if (demos.length) out.push(`<p align="center">Live demos: ${demos.join(' · ')}</p>`, ``);

  // 03 activity
  const top = data.languages.slice(0, 3).map((l) => l.name).join(', ');
  const weeksAlt = `${data.contributions.total.toLocaleString('en-US')} contributions in the last year, shown week by week.`;
  const reposAlt = `Most used languages: ${top}. Latest pushes: ${data.recent.slice(0, cfg.activity.recent).map((r) => r.name).join(', ')}.`;
  heading('section-activity', 'Lately');
  out.push(`<p align="center">`, link(profile, picture('activity-weeks', weeksAlt, CARD_W)), link(repos, picture('activity-repos', reposAlt, CARD_W)), `</p>`, ``);

  // footer
  out.push(`<p align="center">`, link(`${profile}/${cfg.login}/tree/main/scripts`, picture('footer', `${cfg.footer.line} ${cfg.footer.note}`, COLUMN)), `</p>`, ``);
  const links = [`<a href="${repos}">All repositories</a>`, ...cfg.links.map((l) => `<a href="${esc(l.href)}">${esc(l.label)}</a>`)];
  out.push(`<p align="center">${links.join(' · ')}</p>`, ``);

  return out.join('\n');
}
