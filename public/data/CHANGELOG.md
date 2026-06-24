# Atlanta Transit Alerts Data Changelog

This changelog tracks public data-shape changes for the Atlanta Transit Alerts website and API.

## 2026-06-24

- Removed `standard-site.json`. The standard.site (AT Protocol) enhanced-link-card manifest has been dropped; links now use standard Open Graph image cards only. Consumers should stop fetching this endpoint.
- Added `accessibility.json` (`schema_version: 1`): elevator/escalator outage archive.
