// Reads the public numbers of the profile from the GitHub API
// and saves them to data/github.json. Only public data is requested.
// It also checks that every live demo link still answers.
//
// Token: GH_TOKEN or GITHUB_TOKEN. On your own PC it falls back to "gh auth token".

import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import cfg from '../profile.config.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'data', 'github.json');

function readToken() {
  const fromEnv = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  if (fromEnv) return fromEnv;
  try {
    return execFileSync('gh', ['auth', 'token'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
}

const QUERY = `
query ($login: String!, $after: String) {
  user(login: $login) {
    createdAt
    followers { totalCount }
    repositories(first: 100, after: $after, ownerAffiliations: OWNER, privacy: PUBLIC, orderBy: { field: PUSHED_AT, direction: DESC }) {
      totalCount
      pageInfo { hasNextPage endCursor }
      nodes { name pushedAt isFork isArchived primaryLanguage { name } }
    }
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount } }
      }
    }
  }
}`;

async function graphql(token, variables) {
  let lastError;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
          authorization: `bearer ${token}`,
          'content-type': 'application/json',
          'user-agent': 'profile-readme-builder',
        },
        body: JSON.stringify({ query: QUERY, variables }),
      });
      const json = await res.json();
      if (!res.ok || json.errors) throw new Error(`GitHub API ${res.status}: ${JSON.stringify(json.errors || json.message)}`);
      return json.data;
    } catch (error) {
      lastError = error;
      if (attempt < 4) await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
    }
  }
  throw lastError;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Is a demo link up? true or false when the site gives a clear answer.
 * When the answer is unclear (a timeout, a server error), keep what we knew before.
 */
async function demoIsUp(url, before) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, {
        redirect: 'follow',
        signal: AbortSignal.timeout(20000),
        headers: { 'user-agent': 'profile-readme-builder' },
      });
      if (res.ok) return true;
      if (res.status === 404 || res.status === 410) return false;
    } catch {
      // try again
    }
    if (attempt < 3) await sleep(attempt * 1500);
  }
  return before ?? true;
}

const token = readToken();
if (!token) {
  console.error('No GitHub token found. Set GH_TOKEN, or log in with "gh auth login".');
  process.exit(1);
}

const repos = [];
let user;
let after = null;
do {
  const data = await graphql(token, { login: cfg.login, after });
  if (!data.user) {
    console.error(`GitHub user "${cfg.login}" was not found.`);
    process.exit(1);
  }
  user = data.user;
  repos.push(...user.repositories.nodes);
  after = user.repositories.pageInfo.hasNextPage ? user.repositories.pageInfo.endCursor : null;
} while (after);

// Forks are left out of the language count.
const own = repos.filter((r) => !r.isFork);
// The profile repository is left out of the latest pushes.
// The daily refresh pushes to it, and that is not news.
const isProfileRepo = (r) => r.name.toLowerCase() === cfg.login.toLowerCase();

const byLanguage = new Map();
for (const repo of own) {
  const name = repo.primaryLanguage?.name;
  if (name) byLanguage.set(name, (byLanguage.get(name) || 0) + 1);
}
const languages = [...byLanguage]
  .map(([name, count]) => ({ name, repos: count }))
  .sort((x, y) => y.repos - x.repos || x.name.localeCompare(y.name));

const calendar = user.contributionsCollection.contributionCalendar;

const previous = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : {};
const demos = {};
for (const project of [cfg.featured, ...cfg.projects].filter((p) => p && p.live)) {
  demos[project.repo] = await demoIsUp(project.live, previous.demos?.[project.repo]);
  if (!demos[project.repo]) console.warn(`Demo link is down: ${project.live}`);
}

const result = {
  login: cfg.login,
  createdAt: user.createdAt,
  publicRepos: user.repositories.totalCount,
  followers: user.followers.totalCount,
  contributions: {
    total: calendar.totalContributions,
    weeks: calendar.weeks.map((week) => ({
      start: week.contributionDays[0].date,
      count: week.contributionDays.reduce((sum, day) => sum + day.contributionCount, 0),
    })),
  },
  languages,
  countedRepos: own.length,
  recent: own
    .filter((r) => !r.isArchived && !isProfileRepo(r))
    .slice(0, 8)
    .map((r) => ({ name: r.name, language: r.primaryLanguage?.name || '', pushedAt: r.pushedAt.slice(0, 10) })),
  demos,
};

mkdirSync(path.dirname(OUT), { recursive: true });
writeFileSync(OUT, `${JSON.stringify(result, null, 2)}\n`);
console.log(
  `Saved data/github.json: ${result.publicRepos} public repos, ${result.contributions.total} contributions, ${languages.length} languages.`,
);
