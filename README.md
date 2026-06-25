# Atlanta Transit Alerts

Unofficial MARTA service-alert archive and bot-observed disruption dashboard for Atlanta rail, streetcar, and bus service.

Live site: https://atlantatransitalerts.app

## What It Publishes

- Active MARTA alerts and bot-observed disruptions.
- Line, route, station, day, week, stats, compare, and system-health pages.
- Public JSON, CSV, Atom, and JSON Feed outputs.
- Per-line and per-route feeds at `/feed/line/<line>.xml` and `/feed/route/<route>.xml`.

## Data

The site reads **bounded** published data from `https://data.atlantatransitalerts.app/`
so a page load never fetches the entire archive:

- `alerts-recent.json` — rolling recent window (active incidents of any age ∪ the
  last 93 days). Poll this for current data.
- `alerts/<YYYY-MM>.json` — monthly archive shards (by America/New_York month of
  `first_seen`).
- `incidents/by-line/<lineKey>.json` — one line/route's all-time history.
- `alerts-index.json` — manifest: `months[]`, `lines[]`, `id_month`, `rkey_month`.
- `aggregates.json` — precomputed year-over-year (`yoy.overall` + `by_mode.{train,bus}`).
- `accessibility.json`, `daily-counts.json`, `alerts.csv` — unchanged.

To reconstruct the full history, union the `incidents[]` of every shard in
`alerts-index.json`'s `months[]` (each incident lands in exactly one shard).

> **Deprecated:** the full-history `https://data.atlantatransitalerts.app/alerts.json`
> is still published but will be retired — migrate to the files above. See
> `public/data/CHANGELOG.md`.

Public schema notes live in `public/llms.txt`, `public/llms-full.txt`, and `public/data/CHANGELOG.md`.

## Development

```sh
npm ci
npm run dev
npm run lint
npm run build
```
