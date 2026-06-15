import { useEffect, useMemo, useRef, useState } from 'react';
import { BUS_ROUTE_NAMES, compareBusRoutes } from '../lib/busRoutes.js';
import { buildStationIndex } from '../lib/stations.js';
import { isStreetcarRoute, TRAIN_LINE_ORDER, TRAIN_LINES } from '../lib/trainLines.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const WINDOW_DAYS = 90;
const BUS_ROUTE_LIMIT = 15;
const BUS_ROUTE_ROSTER = Object.keys(BUS_ROUTE_NAMES)
  .filter((route) => !isStreetcarRoute(route))
  .sort(compareBusRoutes)
  .slice(0, BUS_ROUTE_LIMIT)
  .map((id) => ({ id, count: null }));
// Stations are trimmed to the busiest few so the menu doesn't end in a wall of
// ~30 uniform rows; the long tail lives on /stations. Each shown row carries its
// 90d incident count, so the list reads as "most affected" rather than a flat
// directory.
const STATION_LIMIT = 8;

// Top bus routes by incident count within the rolling window, returned as
// `{ id, count }`. Mirrors what `prerender-pages.js` would emit a per-route OG
// card for, so the menu only links to pages that actually have prerendered
// cards. The slice is sorted alphabetically (numerically for pure-number
// routes) so users can scan it like a directory; the per-pill count badge
// carries the "how active" signal without forcing a most-active-first reorder.
function topBusRoutes(alerts, observations, now) {
  if (!alerts || !observations) return [];
  const cutoff = now - WINDOW_DAYS * DAY_MS;
  const counts = new Map();
  const bump = (route, ts) => {
    if (ts == null || ts < cutoff) return;
    const key = String(route);
    if (isStreetcarRoute(key)) return;
    counts.set(key, (counts.get(key) || 0) + 1);
  };
  for (const a of alerts) {
    if (a.kind !== 'bus') continue;
    for (const r of a.routes || []) bump(r, a.first_seen_ts);
  }
  for (const o of observations) {
    if (o.kind !== 'bus') continue;
    bump(o.line, o.ts);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, BUS_ROUTE_LIMIT)
    .sort((a, b) => compareBusRoutes(a[0], b[0]))
    .map(([id, count]) => ({ id, count }));
}

function topStations(alerts, observations, now) {
  if (!alerts || !observations) return [];
  const idx = buildStationIndex(alerts, observations, { now, windowDays: WINDOW_DAYS });
  return [...idx.values()]
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, STATION_LIMIT);
}

const ROW_LINK =
  'flex items-center gap-2 px-2 py-1 rounded text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-gh-border transition-colors';
const SUB_LABEL =
  'text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5';
const AGENCY_LABEL =
  'text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200';
const PILL =
  'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold hover:opacity-80 transition-opacity';
const MORE_LINK =
  'block px-2 py-1 mt-1.5 rounded text-xs text-blue-500 hover:text-blue-400 hover:underline';

function StationList({ stations, hrefBase, moreHref, moreLabel }) {
  if (stations.length === 0) return null;
  return (
    <div className="mt-3">
      <p className={SUB_LABEL}>Top stations (last 90d)</p>
      <ul className="space-y-0.5">
        {stations.map((s) => (
          <li key={s.slug}>
            <a
              href={`${hrefBase}/${s.slug}`}
              role="menuitem"
              title={`${s.count} incident${s.count === 1 ? '' : 's'} in the last 90 days`}
              className="flex items-center justify-between gap-2 px-2 py-1 rounded text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-gh-border transition-colors"
            >
              <span className="truncate">{s.name}</span>
              <span className="shrink-0 tabular-nums text-xs text-slate-400 dark:text-slate-500">
                {s.count}
              </span>
            </a>
          </li>
        ))}
      </ul>
      <a href={moreHref} role="menuitem" className={MORE_LINK}>
        {moreLabel}
      </a>
    </div>
  );
}

// Browse dropdown surfaced in the Header on every page. Rail/streetcar lines are
// the stable roster; bus routes and stations are scoped to the rolling 90-day
// window so the menu reflects what's actually been happening recently.
export default function BrowseMenu({ alerts, observations, align = 'right' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  // Snapshot `now` once at mount so the 90-day window cutoff is stable
  // across re-renders (otherwise useMemo below would invalidate every
  // render via a fresh Date.now()). Browse contents shifting by a few
  // hours of data freshness is fine for a navigation menu.
  const [now] = useState(() => Date.now());

  useEffect(() => {
    if (!open) return;
    function handleOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function handleKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const busRoutes = useMemo(
    () => topBusRoutes(alerts, observations, now),
    [alerts, observations, now],
  );
  const busRouteLinks = busRoutes.length > 0 ? busRoutes : BUS_ROUTE_ROSTER;
  const stations = useMemo(
    () => topStations(alerts, observations, now),
    [alerts, observations, now],
  );
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-gh-subtle text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-gh-border transition-colors"
      >
        Browse
        <span aria-hidden="true" className="opacity-60">
          ▾
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute ${
            align === 'left'
              ? 'left-0'
              : // The button always sits in the header's right-side control
                // group, so anchor the panel's right edge to it at every width.
                // Anchoring `left-0` on mobile (the old "responsive" behavior)
                // started the 288px panel near the screen's right edge and ran
                // it off-screen, forcing a horizontal page scroll.
                'right-0'
          } top-full mt-1.5 z-40 bg-white dark:bg-gh-surface border border-slate-200 dark:border-gh-border rounded-lg shadow-lg p-3 w-72 max-w-[calc(100vw-1rem)] max-h-[70vh] overflow-y-auto`}
        >
          <div className="divide-y divide-slate-200 dark:divide-gh-border [&>section]:py-4 [&>section:first-child]:pt-0 [&>section:last-child]:pb-0">
            <section>
              <h3 className={SUB_LABEL}>Views</h3>
              {/* Leading glyphs give each row a visual anchor so the block reads
                  as distinct destinations rather than a uniform gray list. The
                  fixed-width icon slot keeps the labels left-aligned. */}
              <a href="/week" role="menuitem" className={ROW_LINK}>
                <span aria-hidden="true" className="w-5 shrink-0 text-center">
                  🗓️
                </span>
                This week
              </a>
              <a href="/calendar" role="menuitem" className={ROW_LINK}>
                <span aria-hidden="true" className="w-5 shrink-0 text-center">
                  📅
                </span>
                Calendar
              </a>
              <a href="/stats" role="menuitem" className={ROW_LINK}>
                <span aria-hidden="true" className="w-5 shrink-0 text-center">
                  📊
                </span>
                Stats
              </a>
              <a href="/compare" role="menuitem" className={ROW_LINK}>
                <span aria-hidden="true" className="w-5 shrink-0 text-center">
                  ⚖️
                </span>
                Compare
              </a>
              {/* One "System health" label with compact mode links. */}
              <div className="flex flex-wrap items-center gap-1.5 mt-1 px-2 py-1">
                <span className="text-xs text-slate-500 dark:text-slate-400">System health</span>
                <a
                  href="/system/trains"
                  role="menuitem"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-gh-subtle text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-gh-border transition-colors"
                >
                  🚆 Rail
                </a>
                <a
                  href="/system/buses"
                  role="menuitem"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-gh-subtle text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-gh-border transition-colors"
                >
                  🚌 Buses
                </a>
              </div>
            </section>

            <section>
              <h3 className={SUB_LABEL}>More</h3>
              <a href="/about" role="menuitem" className={ROW_LINK}>
                <span aria-hidden="true" className="w-5 shrink-0 text-center">
                  ℹ️
                </span>
                About
              </a>
              <a href="/subscribe" role="menuitem" className={ROW_LINK}>
                <span aria-hidden="true" className="w-5 shrink-0 text-center">
                  🔔
                </span>
                Subscribe
              </a>
              <a href="/privacy" role="menuitem" className={ROW_LINK}>
                <span aria-hidden="true" className="w-5 shrink-0 text-center">
                  🔒
                </span>
                Privacy
              </a>
            </section>

            <section>
              <h3 className={AGENCY_LABEL}>MARTA</h3>

              <div className="mt-2.5">
                <p className={SUB_LABEL}>Rail and streetcar</p>
                <div className="flex flex-wrap gap-1.5">
                  {TRAIN_LINE_ORDER.map((line) => {
                    const info = TRAIN_LINES[line];
                    return (
                      <a
                        key={line}
                        href={`/line/${line}`}
                        role="menuitem"
                        className={PILL}
                        style={{ backgroundColor: info.color, color: info.textColor }}
                      >
                        {line === 'streetcar' ? info.label : `${info.label} Line`}
                      </a>
                    );
                  })}
                </div>
              </div>

              {busRouteLinks.length > 0 && (
                <div className="mt-3">
                  <p className={SUB_LABEL}>
                    {busRoutes.length > 0 ? 'Bus routes (last 90d)' : 'Bus routes'}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {busRouteLinks.map((r) => (
                      <a
                        key={r.id}
                        href={`/route/${r.id}`}
                        role="menuitem"
                        title={
                          r.count == null
                            ? `Route ${r.id}`
                            : `${r.count} incident${r.count === 1 ? '' : 's'} in the last 90 days`
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-gh-subtle text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-gh-border transition-colors"
                      >
                        #{r.id}
                        {r.count != null && (
                          <span className="font-normal tabular-nums opacity-60">{r.count}</span>
                        )}
                      </a>
                    ))}
                  </div>
                  <a href="/routes" role="menuitem" className={MORE_LINK}>
                    All routes →
                  </a>
                </div>
              )}

              <StationList
                stations={stations}
                hrefBase="/station"
                moreHref="/stations"
                moreLabel="All stations →"
              />
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
