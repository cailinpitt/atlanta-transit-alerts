# Atlanta Transit Alerts Data Changelog

This changelog tracks public data-shape changes for the Atlanta Transit Alerts website and API.

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
