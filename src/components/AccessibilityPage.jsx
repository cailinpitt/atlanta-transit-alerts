import { useEffect, useMemo, useState } from 'react';
import { useDarkMode } from '../hooks/useDarkMode.js';
import { useNow } from '../hooks/useNow.js';
import { currentlyOut, fetchAccessibilityData, stationReliability } from '../lib/accessibility.js';
import { topLevelTrail } from '../lib/breadcrumbs.js';
import { formatDate, formatDuration } from '../lib/format.js';
import { TRAIN_LINE_ORDER, TRAIN_LINES } from '../lib/trainLines.js';
import Breadcrumb from './Breadcrumb.jsx';
import Footer from './Footer.jsx';
import Header from './Header.jsx';
import LinePill from './LinePill.jsx';

function StationLink({ outage }) {
  const name = outage.station?.name || 'Unmatched station';
  if (!outage.station?.slug) return <span>{name}</span>;
  return (
    <a href={`/station/${outage.station.slug}`} className="hover:underline">
      {name}
    </a>
  );
}

function Sparkline({ values }) {
  const max = Math.max(...values, 1);
  return (
    <span className="inline-flex h-8 items-end gap-0.5" aria-hidden="true">
      {values.map((v, i) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed weekly buckets
          key={i}
          className="w-1.5 rounded-sm bg-blue-500/70 dark:bg-blue-400/70"
          style={{ height: `${Math.max(2, (v / max) * 28)}px` }}
        />
      ))}
    </span>
  );
}

function LineFilters({ selectedLine, onSelect }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`inline-flex min-h-[28px] items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
          selectedLine == null
            ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900'
            : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-gh-surface dark:text-slate-300 dark:ring-gh-border dark:hover:bg-gh-subtle'
        }`}
      >
        All lines
      </button>
      {TRAIN_LINE_ORDER.map((line) => {
        const info = TRAIN_LINES[line];
        return (
          <button
            key={line}
            type="button"
            onClick={() => onSelect(line)}
            className="inline-flex min-h-[28px] items-center rounded-full px-3 py-1 text-xs font-semibold hover:opacity-80 transition-opacity"
            style={{
              backgroundColor: selectedLine === line ? info.color : `${info.color}22`,
              color: selectedLine === line ? info.textColor : info.color,
            }}
          >
            {info.label}
          </button>
        );
      })}
    </div>
  );
}

export default function AccessibilityPage() {
  const [dark, toggleDark] = useDarkMode();
  const now = useNow();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedLine, setSelectedLine] = useState(null);

  useEffect(() => {
    fetchAccessibilityData().then(setData).catch(setError);
  }, []);

  useEffect(() => {
    document.title = 'Accessibility · Atlanta Transit Alerts';
    return () => {
      document.title = 'Atlanta Transit Alerts';
    };
  }, []);

  const activeOutages = useMemo(
    () => currentlyOut(data?.outages || [], { now, line: selectedLine }),
    [data, now, selectedLine],
  );
  const reliability = useMemo(
    () =>
      stationReliability(data?.outages || [], {
        now,
        windowDays: 90,
        line: selectedLine,
      }),
    [data, now, selectedLine],
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gh-canvas flex flex-col">
      <Header
        generatedAt={data?.generated_at}
        dark={dark}
        onToggleDark={toggleDark}
        onResetFilters={() => {
          window.location.href = '/';
        }}
      />
      <main id="main" tabIndex={-1} className="max-w-5xl mx-auto px-4 py-6 space-y-5 w-full flex-1">
        <div>
          <Breadcrumb items={topLevelTrail('Accessibility')} className="mb-3" />
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Elevator & Escalator Status
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Tracking station accessibility outages
            {data?.data_start_ts ? ` since ${formatDate(data.data_start_ts)}` : ''}.
          </p>
        </div>

        <LineFilters selectedLine={selectedLine} onSelect={setSelectedLine} />

        {error && <p className="text-red-600 text-sm">Failed to load accessibility data.</p>}

        {!error && !data && (
          <div className="space-y-3 animate-pulse">
            <div className="h-32 bg-white dark:bg-gh-surface rounded-lg border border-slate-200 dark:border-gh-border" />
            <div className="h-48 bg-white dark:bg-gh-surface rounded-lg border border-slate-200 dark:border-gh-border" />
          </div>
        )}

        {data && (
          <>
            <section className="bg-white dark:bg-gh-surface rounded-lg border border-slate-200 dark:border-gh-border">
              <div className="p-4 border-b border-slate-100 dark:border-gh-border">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Currently out of service ({activeOutages.length})
                </h2>
              </div>
              {activeOutages.length === 0 ? (
                <p className="p-4 text-sm text-slate-500 dark:text-slate-400">
                  No elevators or escalators reported out of service right now.
                </p>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-gh-border">
                  {activeOutages.map((outage) => (
                    <div key={outage.id} className="p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-800 dark:text-slate-100">
                          <StationLink outage={outage} />
                        </span>
                        <span className="flex flex-wrap gap-1">
                          {(outage.station?.lines || []).map((line) => (
                            <LinePill key={line} kind="train" line={line} linked={false} />
                          ))}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        <span className="capitalize">{outage.unit_type}</span>
                        {outage.unit_label ? ` · ${outage.unit_label}` : ''} · out{' '}
                        {formatDuration(outage.durationMs) || 'just now'}
                      </p>
                      {outage.headline && (
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {outage.headline}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="bg-white dark:bg-gh-surface rounded-lg border border-slate-200 dark:border-gh-border overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-gh-border">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Reliability over the last 90 days
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <tr className="border-b border-slate-100 dark:border-gh-border">
                      <th className="text-left font-semibold p-3">Station</th>
                      <th className="text-right font-semibold p-3">Outages</th>
                      <th className="text-right font-semibold p-3">Total downtime</th>
                      <th className="text-left font-semibold p-3">Weekly</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-gh-border">
                    {reliability.map((row) => (
                      <tr key={row.slug || row.name}>
                        <td className="p-3 text-slate-800 dark:text-slate-100">
                          {row.slug ? (
                            <a
                              href={`/station/${row.slug}`}
                              className="font-medium hover:underline"
                            >
                              {row.name}
                            </a>
                          ) : (
                            <span className="font-medium">{row.name}</span>
                          )}
                          {row.currentlyOut > 0 && (
                            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-400/15 dark:text-amber-200">
                              {row.currentlyOut} current
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right tabular-nums text-slate-600 dark:text-slate-300">
                          {row.outageCount}
                        </td>
                        <td className="p-3 text-right tabular-nums text-slate-600 dark:text-slate-300">
                          {formatDuration(row.totalDownMs) || '0m'}
                        </td>
                        <td className="p-3">
                          <Sparkline values={row.weeklyDownMs} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
