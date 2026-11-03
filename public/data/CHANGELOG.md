# Atlanta Transit Alerts Data Changelog

This changelog tracks public data-shape changes for the Atlanta Transit Alerts website and API.

## 2026-11-03 — Vehicle positions move to Parquet (`positions/`)

**Breaking.** The daily position archive switches from gzipped NDJSON to
Parquet, and `positions/index.json` changes shape. Days, fields and rows are
unchanged; every existing day is converted.

- **`positions/index.json`** — now a small latest pointer (short cache) to an
  immutable manifest, instead of the list of days:

```json
{"manifest_version":2,"path":"positions/manifests/<sha256>.json","sha256":"<sha256>","bytes":12345}
```

- **`positions/manifests/<sha256>.json`** — what `index.json` used to hold:
  `days` (newest first, each with per-mode `rows` and `files`), `coverage`,
  `feeds` (fields with type, unit, nullability and caveats), `known_gaps`, plus
  `format: "parquet"`, `sort_order` (per mode) and `previous_manifest`. Each
  file has `path`, `rows`, `bytes`, `sha256` and min/max timestamps (`ts`, plus
  bus `vehicle_ts` or rail/streetcar `event_ts`). Manifests never change; pin
  one for repeatable analysis.
- **`positions/{bus,rail,streetcar}/YYYY/MM/YYYY-MM-DD.<sha256>.parquet`** —
  ZSTD Parquet with typed columns, sorted by `route, vehicle_id, ts` (bus),
  `line, direction, train_id, ts` (rail) and `line, vehicle_id, ts`
  (streetcar). Names include the file's checksum, so they can't be guessed: go
  through `index.json` → manifest → `path`. A correction gets a new path; old
  ones stay available.
- About a fifth the size of the gzipped NDJSON for buses (a weekday drops from
  roughly 13 MB to 2.7 MB), and reads directly in DuckDB, pandas (with pyarrow)
  or Polars, including just the columns you need.
- Values are unchanged: bus `vehicle_ts` stays in epoch **seconds**, rail and
  streetcar `event_ts` in epoch ms, bus `start_date` as `YYYYMMDD`. Days with
  no rows (rail and streetcar on 2026-10-29) are empty files with the full
  schema.
- The `.ndjson.gz` files are no longer produced and will be removed later.
  Switch to the manifest paths.

```sh
BASE=https://data.atlantatransitalerts.app
MANIFEST=$(curl -s $BASE/positions/index.json | jq -r .path)
FILE=$(curl -s $BASE/$MANIFEST | jq -r '.days[0].files.rail.path')
curl -so rail.parquet $BASE/$FILE
duckdb -c "SELECT line, count(*) FROM 'rail.parquet' GROUP BY line"
```

## 2026-10-31 — Daily vehicle position archive (`positions/`)

**New dataset, additive.** Every MARTA bus, rail and streetcar position the bots
poll is now published as one file per mode per Atlanta service day (midnight to
midnight `America/New_York`), starting 2026-09-28, at
<https://data.atlantatransitalerts.app/positions/>. A new file appears each
night for the previous day; published days never change.

- **`positions/index.json`** — every published day, with each file's `path`,
  `rows`, `bytes` and `sha256`, plus a `schema` object describing each mode's
  fields.
- **`positions/{bus,rail,streetcar}/YYYY/MM/YYYY-MM-DD.ndjson.gz`** — gzipped
  NDJSON, one JSON object per line, ordered by `ts`. Served as a plain `.gz`
  download (`Content-Type: application/gzip`).

```json
{"ts":1793458682421,"train_id":"101","line":"RED","direction":"N","destination":"North Springs","lat":33.75,"lon":-84.39,"delay_sec":0,"event_ts":1793458677000}
```

- `ts` — when we polled the feed (epoch ms).
- **bus:** `route` (public route number), `trip_id` (joins to the MARTA static
  GTFS), `vehicle_id`, `label`, `lat`, `lon`, `bearing`, `speed` (m/s, null when
  the feed omits it), `occupancy`, `vehicle_ts` (GTFS-rt timestamp in epoch
  **seconds**), `start_date`.
- **rail:** `train_id`, `line` (`RED`, `GOLD`, `BLUE`, `GREEN`), `direction`
  (`N`/`S`/`E`/`W`), `destination`, `lat`, `lon`, `delay_sec`, `event_ts`
  (epoch ms).
- **streetcar:** `vehicle_id`, `label` (fleet number), `line` (`SC`),
  `direction` (GTFS `direction_id`, 0 or 1), `trip_id`, `lat`, `lon`,
  `event_ts` (epoch ms).

Positions are polled about every 30 seconds.
