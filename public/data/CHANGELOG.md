# Atlanta Transit Alerts Data Changelog

This changelog tracks public data-shape changes for the Atlanta Transit Alerts website and API.

## 2026-06-24

- Added `standard-site.json`: a [standard.site](https://standard.site) (AT Protocol) manifest used to render enhanced link cards on Bluesky. Shape: `{ "publication": "at://<did>/site.standard.publication/self" | null, "documents": { "<eventId>": "at://<did>/site.standard.document/<eventId>" } }`. `documents` maps each `/event/<id>` slug to its document record's AT-URI; `publication` is null until the records are minted.
- Added `accessibility.json` (`schema_version: 1`): elevator/escalator outage archive.
