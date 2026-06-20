# Atlanta Transit Alerts Data Changelog

This changelog tracks public data-shape changes for the Atlanta Transit Alerts website and API.

## 2026-06-19

- Bot-detected (`detection_source: "roundup"`) bus incidents may now include
  `"cancellation"` in their `signals` array, with a matching evidence bullet of
  the form `"N of M scheduled trips canceled this past hour"`. This is a new
  value in the existing signal/evidence vocabulary; no fields were added or
  removed. Consumers enumerating signal sources should accept the new value.