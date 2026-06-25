# Atlanta Transit Alerts Data Changelog

This changelog tracks public data-shape changes for the Atlanta Transit Alerts website and API.

## 2026-06-25 — Sharded data files + index + aggregates; `alerts.json` deprecated

The full-history `alerts.json` is being replaced by a set of **bounded files** so
clients don't fetch the entire archive on every load. This release is
**additive** — `alerts.json` is still published unchanged for now — but it is
**deprecated** and will be retired in a future release. Migrate to the files
below; watch this changelog for the retirement date.

Every new file carries the same `incidents[]` object shape (schema-v2); only the
*scope* of the array differs. All files are served from
<https://data.atlantatransitalerts.app/>.

- **`alerts-recent.json`** — the rolling recent window: every incident that is
  `active` (any age) or whose `lifecycle.first_seen_ts` is within the last 93
  days. Shape: `schema_version`, `generated_at`, `data_start_ts`,
  `recent_from_ts` (the window's lower bound, epoch ms), `incidents[]`. This is
  what powers the live site; poll it instead of `alerts.json` for current data.
- **`alerts/<YYYY-MM>.json`** — monthly archive shards. Each holds the incidents
  whose `first_seen_ts` falls in that **America/New_York** calendar month. Shape:
  `schema_version`, `month`, `incidents[]`. A shard is effectively immutable once
  its month closes, with one exception: an incident first seen that month but
  resolving later rewrites its shard, so shards carry a 1-day cache TTL rather
  than `immutable`.
- **`incidents/by-line/<lineKey>.json`** — all-time history for one line/route
  (`red`, `gold`, `blue`, `green`, `streetcar`, bus route numbers like `110`; the
  path segment is URL-encoded). Holds every incident whose `routes[]` includes
  that key. Shape: `schema_version`, `line`, `incidents[]`. A multi-line incident
  appears in each of its lines' files.
- **`alerts-index.json`** — the manifest tying it together: `schema_version`,
  `generated_at`, `data_start_ts`, `recent_from_ts`, `months[]` (each `{ key,
  url, count, min_ts, max_ts }`, newest first), `lines[]` (each `{ key, url,
  count }`), `id_month` (incident `id` → month key), and `rkey_month` (any
  non-canonical Bluesky post rkey of an incident → month key, for resolving
  deep links that don't use the canonical `id`).
- **`aggregates.json`** — precomputed year-over-year counts (the one rollup that
  needs more than the recent window): `schema_version`, `generated_at`,
  `data_start_ts`, and `yoy { window_days, overall, by_mode { train, bus } }`.
  Rail and streetcar incidents both count toward `train`; buses are `bus`. Each
  YoY bucket is `{ enoughData, currentCount, priorCount, pctChange,
  currentStartTs, currentEndTs, priorStartTs, priorEndTs }` — a trailing
  `window_days`-day count vs. the same window a year earlier.

**Reconstructing all-time data** (the old `alerts.json` scope): union the
`incidents[]` of every shard in `alerts-index.json`'s `months[]`. Each incident
lands in exactly one monthly shard (its `first_seen` month), so the union is the
complete archive with no de-duplication needed.

`alerts.json`, `alerts.csv`, `accessibility.json`, and `daily-counts.json` are
all **unchanged** by this release.

## 2026-06-24

- Removed `standard-site.json`. The standard.site (AT Protocol) enhanced-link-card manifest has been dropped; links now use standard Open Graph image cards only. Consumers should stop fetching this endpoint.
- Added `accessibility.json` (`schema_version: 1`): elevator/escalator outage archive.
