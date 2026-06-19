# Atlanta Transit Alerts Data Changelog

This changelog tracks public data-shape changes for the Atlanta Transit Alerts website and API.

## 2026-06-19 - Rail dead-segment ("pulse") detections

- Rail bot detections gain a new `detections[].source` value: `pulse-cold`. It
  marks a stretch of track between two stations that no train passed through for
  longer than the schedule allows (a dead/suspended segment), as inferred from
  live train positions. These appear as standalone incidents (`sources: ["bot"]`,
  `mode: "rail"`), paired with their `observed-clear` resolution the same way the
  existing bus `pulse-cold` and `thin-gap` route-silence incidents are.
- For these rail detections, `detections[].scope.near_stop` carries the affected
  segment as `"<from> ↔ <to>"` (e.g. `"Lenox ↔ Chamblee"`); it remains `null`
  for detections that aren't segment-scoped. `detections[].evidence.details`
  carries the canonical (slug-matching) `from`/`to` station names plus
  `coldStations`, `headwayMin`, `minutesSinceLastTrain`, and `expectedTrains`.
- `description` reads e.g. `Gold Line trains not moving between Lenox and
  Chamblee` (or `… trains stuck between …` when trains are held in place, or
  `… no trains running` for a whole-line blackout).

## 2026-06-18 - Incident delay status

- `incidents[].status` may now be `{ "type": "delay" }`, joining the existing
  `{ "type": "cancellation", ... }`. It is set when an official MARTA alert
  reports delays (effect `SIGNIFICANT_DELAYS` or "delay" wording) OR a paired bot
  detection is a headway gap. A cancellation status takes precedence.
- `status` is omitted (absent) when an incident is neither a delay nor a
  cancellation. Consumers should treat a missing `status` as "no special status".

## 2026-06-18 - Descriptive official-alert headlines

- `incidents[].official_alert.headline` is now a synthesized, scannable name
  describing the affected route(s) plus the nature of the disruption — e.g.
  `Green Line partial service`, `Red/Gold Line delays`, `Route 110 detour` —
  instead of MARTA's generic `Rail Service Alert for …` header.
- `incidents[].official_alert.description` is unchanged: it still carries
  MARTA's verbatim alert text.
- Each entry in `incidents[].official_alert.versions[]` carries the same
  synthesized `headline`; its `description` remains MARTA's verbatim prose.
- The affected station segment is unchanged in `official_alert.scope`
  (`from_station` / `to_station`); it is no longer folded into `headline`.

## 2026-06-15 - Atlanta rebrand and MARTA-only website export

- Website-facing feeds, sitemap, CSV export, prerendered pages, and public docs are scoped to MARTA train, streetcar, and bus incidents.
- The website publishes only MARTA train, streetcar, and bus pages, feeds, sitemap entries, and public documentation.
- The source repository reference is now `cailinpitt/atlanta-transit-alerts`.

## Schema notes

- `incidents[].kind` is `train` or `bus` for website-facing Atlanta data.
- `incidents[].routes` contains MARTA line names for train/streetcar incidents and MARTA route ids for bus incidents.
- The `official` object and `agency_event_*` fields are retained as legacy schema names for the official-alert block. In Atlanta data, those fields describe MARTA alerts.
- `observations[]` contains bot detections for the same incident when available.
