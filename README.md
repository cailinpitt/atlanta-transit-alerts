# Atlanta Transit Alerts

Unofficial MARTA service-alert archive and bot-observed disruption dashboard for Atlanta rail, streetcar, and bus service.

Live site: https://atlantatransitalerts.app

## What It Publishes

- Active MARTA alerts and bot-observed disruptions.
- Line, route, station, day, week, stats, compare, and system-health pages.
- Public JSON, CSV, Atom, and JSON Feed outputs.
- Per-line and per-route feeds at `/feed/line/<line>.xml` and `/feed/route/<route>.xml`.

## Data

The site reads published data from:

- `https://data.atlantatransitalerts.app/alerts.json`
- `https://data.atlantatransitalerts.app/daily-counts.json`
- `https://data.atlantatransitalerts.app/alerts.csv`

Public schema notes live in `public/llms.txt`, `public/llms-full.txt`, and `public/data/CHANGELOG.md`.

## Development

```sh
npm ci
npm run dev
npm run lint
npm run build
```
