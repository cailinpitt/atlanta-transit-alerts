const LINK = 'text-blue-500 hover:text-blue-400 hover:underline';

export default function AboutContent() {
  return (
    <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
      <p>
        A public archive of MARTA service disruptions — one place to check how Atlanta transit is
        doing right now, this week, or over the past few months.
      </p>
      <p className="text-xs italic text-slate-500 dark:text-slate-400">
        Unofficial. Not affiliated with, endorsed by, or sponsored by MARTA.
      </p>

      <h3 className="font-semibold text-slate-700 dark:text-slate-200 pt-2">
        Where the data comes from
      </h3>
      <p>Three Bluesky bots feed this archive:</p>
      <ul className="list-disc list-outside ml-5 space-y-2">
        <li>
          <a
            className={LINK}
            href="https://bsky.app/profile/martaalertinsights.atlantatransitalerts.app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <strong>@martaalertinsights</strong>
          </a>{' '}
          — republished official MARTA alerts, plus bot-detected disruption roundups when several
          smaller signals cluster on the same line or route.
        </li>
        <li>
          <a
            className={LINK}
            href="https://bsky.app/profile/martatraininsights.atlantatransitalerts.app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <strong>@martatraininsights</strong>
          </a>{' '}
          — MARTA rail speedmaps, bunching, long gaps versus the scheduled headway, and ghost
          detections when fewer trains are running than expected.
        </li>
        <li>
          <a
            className={LINK}
            href="https://bsky.app/profile/martabusinsights.atlantatransitalerts.app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <strong>@martabusinsights</strong>
          </a>{' '}
          — MARTA bus speedmaps, bunching, long gaps versus the scheduled headway, and ghost
          detections when fewer buses are running than expected.
        </li>
      </ul>
      <p>
        When an official alert and a bot observation describe the same incident on the same line
        within a couple of hours, they're merged into a single entry rather than counted twice. This
        pairing happens server-side before the website renders the incident.
      </p>

      <h3 className="font-semibold text-slate-700 dark:text-slate-200 pt-2">
        How MARTA detection works
      </h3>
      <p>
        The bots compare MARTA realtime vehicle positions, trip updates, rail train data, static
        schedules, and official ServiceAlerts. They look for long headway gaps, bunching, ghost
        vehicles, unusually slow movement, and full-line or full-route disruption patterns.
      </p>

      <h3 className="font-semibold text-slate-700 dark:text-slate-200 pt-2">Updates</h3>
      <p>
        The page checks for new data every 5 minutes while visible. The "Last data change" timestamp
        in the header tracks the most recent change to the alerts — not when the system last
        checked. An older time just means nothing new has happened.
      </p>

      <h3 className="font-semibold text-slate-700 dark:text-slate-200 pt-2">How far back</h3>
      <p>
        The MARTA archive starts on June 15, 2026. Stats, calendar, and leaderboard views draw from the
        coverage window published in the data feed.
      </p>

      <h3 className="font-semibold text-slate-700 dark:text-slate-200 pt-2">Privacy</h3>
      <p>
        No accounts, no cookies, and no advertising — the site doesn't collect personal data. It
        uses cookieless Cloudflare Web Analytics for rough, aggregate page-view counts, which don't
        identify or profile you. Your dark-mode and filter preferences are saved locally in your
        browser and never leave your device. Full details on the{' '}
        <a className={LINK} href="/privacy">
          privacy page
        </a>
        .
      </p>

      <p className="pt-2 text-xs text-slate-500 dark:text-slate-400">
        Source on{' '}
        <a
          className={LINK}
          href="https://github.com/cailinpitt/atlanta-transit-alerts"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        .
      </p>
    </div>
  );
}
