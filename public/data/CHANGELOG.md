# Atlanta Transit Alerts Data Changelog

This changelog tracks public data-shape changes for the Atlanta Transit Alerts website and API.

## 2026-06-15 - Atlanta rebrand and MARTA-only website export

- Website-facing feeds, sitemap, CSV export, prerendered pages, and public docs are scoped to MARTA train, streetcar, and bus incidents.
- The website publishes only MARTA train, streetcar, and bus pages, feeds, sitemap entries, and public documentation.
- The source repository reference is now `cailinpitt/atlanta-transit-alerts`.

## Schema notes

- `incidents[].kind` is `train` or `bus` for website-facing Atlanta data.
- `incidents[].routes` contains MARTA line names for train/streetcar incidents and MARTA route ids for bus incidents.
- The `official` object and `agency_event_*` fields are retained as legacy schema names for the official-alert block. In Atlanta data, those fields describe MARTA alerts.
- `observations[]` contains bot detections for the same incident when available.
