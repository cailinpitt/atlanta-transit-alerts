// Fetch the published data files from the R2 data origin into public/data/
// *before* the build, so the deployed snapshot + the postbuild steps
// (prerender-events, generate-feed, generate-sitemap, generate-csv) have
// current data without it being committed to the repo. Runs automatically as
// the npm `prebuild` hook.
//
// Resilience: if the origin is unreachable but a local copy already exists
// (e.g. during local development, or a transient R2 hiccup), we keep the
// existing file rather than failing the build. If alerts.json is not published
// yet, seed an empty schema-v2 payload so the shell can deploy before data
// publishing is online.
//
// Env:
//   DATA_ORIGIN_URL   override the origin (default: the prod R2 custom domain)
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ORIGIN = (process.env.DATA_ORIGIN_URL || 'https://data.atlantatransitalerts.app').replace(
  /\/$/,
  '',
);
const OUT_DIR = resolve(__dirname, '..', 'public', 'data');
const FILES = ['alerts.json', 'daily-counts.json'];
const EMPTY_ALERTS = {
  schema_version: 2,
  generated_at: Date.now(),
  incidents: [],
};

mkdirSync(OUT_DIR, { recursive: true });

for (const file of FILES) {
  const url = `${ORIGIN}/${file}`;
  const dest = resolve(OUT_DIR, file);
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = Buffer.from(await res.arrayBuffer());
    writeFileSync(dest, body);
    console.log(`fetch-data: ${file} <- ${url} (${body.length} bytes)`);
  } catch (err) {
    if (existsSync(dest)) {
      console.warn(`fetch-data: ${file} fetch failed (${err.message}); using existing ${dest}`);
    } else {
      console.error(`fetch-data: ${file} fetch failed (${err.message}) and no local copy`);
    }
  }
}

if (!existsSync(resolve(OUT_DIR, 'alerts.json'))) {
  const dest = resolve(OUT_DIR, 'alerts.json');
  writeFileSync(dest, `${JSON.stringify(EMPTY_ALERTS, null, 2)}\n`);
  console.warn(`fetch-data: seeded empty alerts payload at ${dest}`);
}
