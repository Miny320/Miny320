// Checks the built files before they are published.
// It stops with an error when an image is broken, missing, too heavy,
// or when it points at something outside its own file.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { XMLValidator } from 'fast-xml-parser';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS = path.join(ROOT, 'assets');
const MAX_FILE_KB = 90;
const MAX_THEME_KB = 600;

const errors = [];
const fail = (message) => errors.push(message);

if (!existsSync(ASSETS)) {
  console.error('assets/ is missing. Run "npm run build" first.');
  process.exit(1);
}

const files = readdirSync(ASSETS).filter((f) => f.endsWith('.svg')).sort();
if (files.length === 0) fail('assets/ holds no images.');

const themeBytes = { dark: 0, light: 0 };

for (const file of files) {
  const svg = readFileSync(path.join(ASSETS, file), 'utf8');
  const kb = Buffer.byteLength(svg) / 1024;
  const theme = file.endsWith('-dark.svg') ? 'dark' : file.endsWith('-light.svg') ? 'light' : null;

  if (!theme) {
    fail(`${file}: the name must end with -dark.svg or -light.svg.`);
  } else {
    themeBytes[theme] += kb;
    const twin = file.replace(/-(dark|light)\.svg$/, theme === 'dark' ? '-light.svg' : '-dark.svg');
    if (!files.includes(twin)) fail(`${file}: its twin ${twin} is missing.`);
  }

  const valid = XMLValidator.validate(svg);
  if (valid !== true) fail(`${file}: not well-formed XML (${valid.err.msg}, line ${valid.err.line}).`);

  if (kb > MAX_FILE_KB) fail(`${file}: ${Math.round(kb)} KB, the limit is ${MAX_FILE_KB} KB.`);

  // An image inside a README cannot load anything from outside, so it must not try.
  const withoutNamespace = svg.replace('xmlns="http://www.w3.org/2000/svg"', '');
  if (/https?:\/\//.test(withoutNamespace)) fail(`${file}: holds an outside URL.`);
  for (const banned of ['<script', '<foreignObject', '<image', '@import', '<text', 'NaN', 'undefined']) {
    if (svg.includes(banned)) fail(`${file}: holds "${banned}".`);
  }

  // Every reference must point at an id inside the same file.
  const ids = new Set([...svg.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  const refs = [...svg.matchAll(/href="#([^"]+)"/g), ...svg.matchAll(/url\(#([^)]+)\)/g)].map((m) => m[1]);
  for (const ref of new Set(refs)) {
    if (!ids.has(ref)) fail(`${file}: points at #${ref}, which does not exist.`);
  }
  if (ids.size !== [...svg.matchAll(/\sid="/g)].length) fail(`${file}: the same id is used twice.`);

  if (!/<title>[^<]+<\/title>/.test(svg)) fail(`${file}: has no title for screen readers.`);
}

for (const [theme, kb] of Object.entries(themeBytes)) {
  if (kb > MAX_THEME_KB) fail(`The ${theme} images weigh ${Math.round(kb)} KB together, the limit is ${MAX_THEME_KB} KB.`);
}

// The README and the images must match each other.
const readmePath = path.join(ROOT, 'README.md');
if (!existsSync(readmePath)) {
  fail('README.md is missing.');
} else {
  const readme = readFileSync(readmePath, 'utf8');
  const used = new Set([...readme.matchAll(/assets\/([\w.-]+\.svg)/g)].map((m) => m[1]));
  for (const name of used) if (!files.includes(name)) fail(`README.md uses assets/${name}, which does not exist.`);
  for (const file of files) if (!used.has(file)) fail(`assets/${file} is not used in README.md.`);
  for (const img of readme.matchAll(/<img\s[^>]*>/g)) {
    if (!/\salt="[^"]+"/.test(img[0])) fail(`README.md has an image without alt text: ${img[0].slice(0, 80)}`);
  }
  // House style: plain punctuation only.
  if (readme.includes('—')) fail('README.md holds an em dash. Use a comma or two sentences instead.');
}

if (errors.length) {
  console.error(`Check failed, ${errors.length} problem${errors.length === 1 ? '' : 's'}:`);
  for (const message of errors) console.error(`  - ${message}`);
  process.exit(1);
}

console.log(
  `Check passed: ${files.length} images, ${Math.round(themeBytes.dark)} KB dark and ${Math.round(themeBytes.light)} KB light, all used by README.md.`,
);
