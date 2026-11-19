// Draws every image of the README, once per theme, into assets/.
// Input: profile.config.mjs (the words) and data/github.json (the numbers).

import { readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import config from '../profile.config.mjs';
import { themes } from './lib/theme.mjs';
import { heroTitle, heroStack } from './lib/hero.mjs';
import { section } from './lib/section.mjs';
import { tile } from './lib/tile.mjs';
import { featureText, featureArt, card } from './lib/cards.mjs';
import { activityWeeks, activityRepos } from './lib/activity.mjs';
import { footer } from './lib/footer.mjs';
import { readme } from './lib/readme.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS = path.join(ROOT, 'assets');
const data = JSON.parse(readFileSync(path.join(ROOT, 'data', 'github.json'), 'utf8'));

// A project only keeps its "live" link while the last check found the site up.
const checked = (p) => {
  if (!p || !p.live || data.demos?.[p.repo] !== false) return p;
  console.warn(`Demo link is down, so the LIVE badge is hidden: ${p.live}`);
  return { ...p, live: undefined };
};
const cfg = { ...config, featured: checked(config.featured), projects: config.projects.map(checked) };

mkdirSync(ASSETS, { recursive: true });
const written = new Set();
let bytes = 0;

function save(name, svg) {
  writeFileSync(path.join(ASSETS, name), svg);
  written.add(name);
  bytes += Buffer.byteLength(svg);
}

const projectCount = cfg.projects.length + (cfg.featured ? 1 : 0);

for (const theme of Object.values(themes)) {
  const id = theme.id;
  save(`hero-title-${id}.svg`, heroTitle(theme, cfg, data));
  save(`hero-stack-${id}.svg`, heroStack(theme, cfg));

  save(`section-stack-${id}.svg`, section(theme, { index: '01', title: 'What I build', note: `${cfg.layers.length} layers` }));
  cfg.layers.forEach((layer, i) => save(`layer-${layer.art}-${id}.svg`, tile(theme, layer, i)));

  save(`section-work-${id}.svg`, section(theme, { index: '02', title: 'Selected work', note: `${projectCount} projects` }));
  if (cfg.featured) {
    save(`work-${cfg.featured.repo}-${id}.svg`, featureText(theme, cfg.featured));
    save(`work-${cfg.featured.repo}-figure-${id}.svg`, featureArt(theme, cfg.featured));
  }
  cfg.projects.forEach((project) => save(`work-${project.repo}-${id}.svg`, card(theme, project)));

  save(`section-activity-${id}.svg`, section(theme, { index: '03', title: 'Lately', note: 'Live numbers' }));
  save(`activity-weeks-${id}.svg`, activityWeeks(theme, cfg, data));
  save(`activity-repos-${id}.svg`, activityRepos(theme, cfg, data));

  save(`footer-${id}.svg`, footer(theme, cfg));
}

// Remove images that this build no longer makes.
for (const file of readdirSync(ASSETS)) {
  if (file.endsWith('.svg') && !written.has(file)) unlinkSync(path.join(ASSETS, file));
}

writeFileSync(path.join(ROOT, 'README.md'), readme(cfg, data));

console.log(`Drew ${written.size} images into assets/ (${Math.round(bytes / 1024)} KB in total) and wrote README.md.`);
