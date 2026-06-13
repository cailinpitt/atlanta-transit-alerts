# Porting `chicago-transit-alerts` → `atlanta-transit-alerts`

This repo is a fork-first port of
[`chicago-transit-alerts`](https://github.com/cailinpitt/chicago-transit-alerts) to
MARTA / Atlanta. Because we copied the Chicago tree wholesale, CTA/Metra-specific code,
metadata, and copy will sit unused until ported or deleted. This file is the source of
truth for **what is Chicago-only and slated for removal**, so dead code doesn't quietly
accumulate.

## The governing rule

> Keep Chicago code **only while it is serving as a reference** for the MARTA version you
> are writing. Once the MARTA analog exists — or you've decided there is no analog —
> **delete it in the same change**. Nothing stays in the tree marked "might be useful."

This is a consumer of the public `alerts.json` (schema v2, `incidents[]`). The wire
contract stays the same; what changes is **metadata** (lines/stations/routes), **copy**
(Chicago/CTA → Atlanta/MARTA), **timezone**, and the removal of **Metra**.

## MARTA vs CTA/Metra, in one paragraph

The Atlanta site covers MARTA **rail** (Red, Gold, Blue, Green — 4 lines, not CTA's 8),
**bus**, and the **Atlanta Streetcar** (new mode, no CTA analog). There is **no commuter
rail**, so every `metra*` module/component is destined for deletion. Two cross-cutting
swaps touch many files: **timezone** (`America/Chicago` → `America/New_York`) and **line
identity/colors** (CTA line palette → MARTA Red/Gold/Blue/Green).

## Status legend

- **PORT** — logic reusable; swap CTA metadata/copy for MARTA.
- **KEEP** — generic UI/infra; rebrand strings only.
- **DELETE** — CTA/Metra-only, no MARTA analog.
- **NEW** — no Chicago source; build for MARTA (e.g. streetcar).

---

## `src/lib/` — data + metadata

| Module(s) | Status | Notes |
|---|---|---|
| `dataSource.js` | PORT | `DATA_ORIGIN` → `https://data.atlantatransitalerts.app`. |
| `incidents.js` | PORT | Keep v2 typedefs, `incidentRecords`, filtering/search. Remove Metra-line filter branches; keep `agency`/`mode` generic. **No v1 / client fuzzy matching.** |
| `aggregate.js`, `csv.js`, `calendar.js`, `breadcrumbs.js`, `eventTracks.js`, `staleAssetReload.js` | KEEP/PORT | Generic; drop Metra buckets, rebrand. |
| `format.js` | PORT | **Timezone:** Chicago-day UTC helpers → `America/New_York`. Affects all day bucketing. |
| `urlState.js` | PORT | Line code normalization + `metra=` params → MARTA lines. |
| `ctaLines.js`, `trainLines.json`, `trainStations.json`, `stations.js`, `lineMap.js` | PORT | Replace with MARTA rail lines (Red/Gold/Blue/Green), colors, and stations. |
| `busRoutes.js` | PORT | MARTA bus route metadata from GTFS. |
| `metraLines.js`, `metraLineMap.js`, `metraLineShapes.json`, `metraStations.js`, `metraStations.json`, `metraGate.js`, `cancellation.js` | DELETE | Metra-only metadata + cancellation rendering. |

## `src/components/` — mostly KEEP (generic UI)

| Component(s) | Status | Notes |
|---|---|---|
| `Header`, `Footer`, `Filters`, `HomeFilters`, `IncidentList`, `ActiveAlerts`, `SignalBreakdown`, `RecentActivityGantt`, `HourOfWeekHeatmap`, `CalendarPage`, `StatsPage`, `ComparePage`, `DayPage`, `BrowseMenu`, `Breadcrumb`, `CollapsibleSection`, `HighlightedText`, `ShareLink`, `NotFoundPage` | KEEP | Generic; rebrand copy/colors. |
| `LinePage`, `LinePill`, `LineMap`, `MultiLineEventMap`, `StationPage`, `StationName`, `StationsIndexPage`, `RoutesIndexPage` | PORT | MARTA rail lines/colors/stations + bus routes. |
| `EventPage`, `EventMap`, `EventReplay`, `OfficialBadge`, `LongRunningBanner`, `AboutContent/Page`, `PrivacyPage`, `SubscribeContent/Page`, `SystemPage` | KEEP/PORT | Rebrand; About/Privacy/Subscribe copy is Chicago-specific. |
| `MetraPointBadge`, `MetraUpcomingCancellations` | DELETE | Metra-only. |
| Atlanta Streetcar surfaces | NEW | No CTA analog; add where rail/bus are handled. |

## `src/components/event/`

| Module(s) | Status | Notes |
|---|---|---|
| `EventDetail`, `EventNav`, `AffectedStations`, `MiniTimeline`, `RelatedIncidents`, `CopySummary`, `callouts.js`, `incidentText.jsx` | KEEP/PORT | Generic detail UI; rebrand line/station references. Strip Metra cancellation-status rendering. |

## `scripts/` — build outputs

| Script | Status | Notes |
|---|---|---|
| `fetch-data.js` | PORT | Origin URL → Atlanta R2. |
| `generate-feed.js`, `generate-csv.js`, `generate-sitemap.js` | PORT | Remove per-Metra-line loops; emit MARTA rail/bus/streetcar feeds. |
| `prerender-events.js`, `prerender-pages.js`, `prerender-static.js` | PORT | Line lists: 8 CTA + 11 Metra → 4 MARTA rail lines; remove Metra; add streetcar. |
| `og-*-template.html` | PORT | Rebrand colors/copy (CTA palette → MARTA). |

## `public/` — assets + SEO

| File | Status | Notes |
|---|---|---|
| `CNAME` | PORT | `chicagotransitalerts.app` → `atlantatransitalerts.app`. |
| `llms.txt`, `llms-full.txt`, `manifest.webmanifest`, `robots.txt`, `og-image.png`, icons | PORT | Rebrand copy/branding. |
| `data/CHANGELOG.md` | KEEP | Public-API changelog; keep dated entries for data consumers. |

## `.github/workflows/`

| File | Status | Notes |
|---|---|---|
| `deploy.yml`, `ci.yml` | PORT | Repo-dispatch event source, Pages domain, and WebSub hub URLs → Atlanta. |

---

## Cross-cutting swaps (touch many files — grep for these)

- **Timezone:** `America/Chicago` → `America/New_York` (day bucketing in `format.js` and anything that calls it).
- **Line identity/colors:** CTA line palette → MARTA Red / Gold / Blue / Green.
- **Metra removal:** every `metra*` symbol, `commuter_rail` mode handling, and the `metraGate`.
- **New mode:** Atlanta Streetcar, wherever rail/bus modes are enumerated.
- **Domain/branding:** `chicagotransitalerts.app` → `atlantatransitalerts.app`, "CTA"/"Chicago" copy → "MARTA"/"Atlanta".

## knip (mechanical backstop)

[`knip`](https://knip.dev) is wired via `knip.json` + the `knip` npm script. Entry roots are
the Vite app (auto-detected from `index.html` → `src/main.jsx`), the `scripts/` build tools,
and the Vitest test files.

```bash
npm install        # required for an authoritative run (loads knip's vite/vitest plugins)
npm run knip       # focused: unused files + dependencies
npx knip           # full report, incl. unused exports (noisier)
```

**What to watch:** the **"Unused files"** section. It surfaces orphaned components/modules
as you delete Metra and rebrand — concrete deletion candidates to reconcile against the
DELETE rows above.

**Known noise (ignore):** running before `npm install` errors on `vite.config.js`
(`@vitejs/plugin-react` not resolved) and false-flags `src/test/setup.js` and a few
test/build devDependencies, because knip's vite/vitest plugins need `node_modules`. Install
first for a clean run.
