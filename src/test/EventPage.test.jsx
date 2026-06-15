import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import EventPage from '../components/EventPage.jsx';
import { incident } from './v2TestHelpers.js';

const NOW = 1_000_000_000_000;

// Build the published incident wire shape: a top-level incident with a nullable
// `official` block and an `observations[]` list. Rail and streetcar route keys
// are already normalized by the exporter.
function officialBlock(over) {
  return {
    alert_id: 'a',
    headline: '',
    short_description: null,
    mentioned_stations: [],
    affected_from_station: null,
    affected_to_station: null,
    affected_direction: null,
    resolved_reply_url: null,
    agency_event_start_ts: null,
    agency_event_end_ts: null,
    agency_event_start_is_date_only: false,
    agency_event_end_is_date_only: false,
    ...over,
  };
}

const PAYLOAD = {
  generated_at: NOW,
  data_start_ts: NOW - 90 * 24 * 60 * 60_000,
  incidents: [
    {
      id: 'abc123',
      kind: 'train',
      routes: ['red'],
      first_seen_ts: NOW - 60 * 60_000,
      resolved_ts: NOW - 30 * 60_000,
      active: false,
      sources: ['official'],
      official: officialBlock({
        alert_id: 'a1',
        headline: 'Red Line Delays at Five Points',
        first_seen_ts: NOW - 60 * 60_000,
        resolved_ts: NOW - 30 * 60_000,
        active: false,
        post_url: 'https://bsky.app/profile/did:plc:abc/post/abc123',
      }),
      observations: [],
    },
    {
      id: 'redplaza',
      kind: 'train',
      routes: ['red'],
      first_seen_ts: NOW - 45 * 60_000,
      resolved_ts: NOW - 15 * 60_000,
      active: false,
      sources: ['official'],
      official: officialBlock({
        alert_id: 'a3',
        headline: 'Red Line Delays near Five Points',
        short_description:
          'Red Line service is experiencing delays due to police activity near Five Points Plaza. Trains stopped near Five Points.',
        mentioned_stations: ['FIVE POINTS Station'],
        first_seen_ts: NOW - 45 * 60_000,
        resolved_ts: NOW - 15 * 60_000,
        active: false,
        post_url: 'https://bsky.app/profile/did:plc:abc/post/redplaza',
      }),
      observations: [],
    },
    {
      id: 'busreroute',
      kind: 'bus',
      routes: ['2', '6'],
      first_seen_ts: NOW - 30 * 60_000,
      resolved_ts: NOW - 5 * 60_000,
      active: false,
      sources: ['official'],
      official: officialBlock({
        alert_id: 'a2',
        headline: 'Temporary Reroute',
        short_description: 'SB Peachtree Street will be closed between Baker and Ellis.',
        affected_from_station: 'Baker',
        affected_to_station: 'Ellis',
        first_seen_ts: NOW - 30 * 60_000,
        resolved_ts: NOW - 5 * 60_000,
        active: false,
        post_url: 'https://bsky.app/profile/did:plc:abc/post/busreroute',
      }),
      observations: [],
    },
    {
      id: 'multirail',
      kind: 'train',
      routes: ['red', 'gold'],
      first_seen_ts: NOW - 40 * 60_000,
      resolved_ts: NOW - 10 * 60_000,
      active: false,
      sources: ['official', 'bot'],
      official: officialBlock({
        alert_id: 'loop1',
        headline: 'Downtown rail service delayed',
        first_seen_ts: NOW - 40 * 60_000,
        resolved_ts: NOW - 10 * 60_000,
        active: false,
        post_url: 'https://bsky.app/profile/did:plc:abc/post/loopevt',
      }),
      observations: [
        {
          id: 201,
          kind: 'train',
          line: 'red',
          from_station: 'CIVIC CENTER Station',
          to_station: 'FIVE POINTS Station',
          detection_source: 'pulse-cold',
          ts: NOW - 38 * 60_000,
          resolved_ts: NOW - 12 * 60_000,
          active: false,
          post_url: 'https://bsky.app/profile/did:plc:xyz/post/obsRed',
        },
        {
          id: 202,
          kind: 'train',
          line: 'gold',
          from_station: 'ARTS CENTER Station',
          to_station: 'FIVE POINTS Station',
          detection_source: 'pulse-cold',
          ts: NOW - 36 * 60_000,
          resolved_ts: NOW - 12 * 60_000,
          active: false,
          post_url: 'https://bsky.app/profile/did:plc:xyz/post/obsGold',
        },
      ],
    },
    {
      id: 'sharedtrk',
      kind: 'train',
      routes: ['red', 'gold'],
      first_seen_ts: NOW - 40 * 60_000,
      resolved_ts: NOW - 10 * 60_000,
      active: false,
      sources: ['official', 'bot'],
      official: officialBlock({
        alert_id: 'shared1',
        headline: 'Delays between Civic Center and Five Points affecting Red and Gold Line service',
        first_seen_ts: NOW - 40 * 60_000,
        resolved_ts: NOW - 10 * 60_000,
        active: false,
        post_url: 'https://bsky.app/profile/did:plc:abc/post/sharedtrk',
      }),
      observations: [
        {
          id: 301,
          kind: 'train',
          line: 'red',
          from_station: 'CIVIC CENTER Station',
          to_station: 'FIVE POINTS Station',
          detection_source: 'pulse-cold',
          ts: NOW - 38 * 60_000,
          resolved_ts: NOW - 12 * 60_000,
          active: false,
          post_url: 'https://bsky.app/profile/did:plc:xyz/post/obsSharedRed',
        },
      ],
    },
    {
      id: 'redonly',
      kind: 'train',
      routes: ['red'],
      first_seen_ts: NOW - 40 * 60_000,
      resolved_ts: NOW - 10 * 60_000,
      active: false,
      sources: ['official', 'bot'],
      official: officialBlock({
        alert_id: 'redonly1',
        headline: 'Red Line Delays near Civic Center',
        first_seen_ts: NOW - 40 * 60_000,
        resolved_ts: NOW - 10 * 60_000,
        active: false,
        post_url: 'https://bsky.app/profile/did:plc:abc/post/redonly',
      }),
      observations: [
        {
          id: 401,
          kind: 'train',
          line: 'red',
          from_station: 'CIVIC CENTER Station',
          to_station: 'FIVE POINTS Station',
          detection_source: 'pulse-cold',
          ts: NOW - 38 * 60_000,
          resolved_ts: NOW - 12 * 60_000,
          active: false,
          post_url: 'https://bsky.app/profile/did:plc:xyz/post/obsRedOnly',
        },
      ],
    },
    {
      id: 'bus99',
      kind: 'bus',
      routes: ['66'],
      first_seen_ts: NOW - 10 * 60_000,
      resolved_ts: null,
      active: true,
      sources: ['bot'],
      official: null,
      observations: [
        {
          id: 99,
          kind: 'bus',
          line: '66',
          ts: NOW - 10 * 60_000,
          resolved_ts: null,
          active: true,
          post_url: 'https://bsky.app/profile/did:plc:xyz/post/bus99',
        },
      ],
    },
    {
      // Obs-only pulse-cold with a back-dated concrete onset. "First seen"
      // tracks onset_ts (80 min ago) but the detection post is only 10 min ago;
      // the timeline must carry a third "Per bot" entry at the onset, ahead of
      // the detection and clear entries, so the rail lines up with First seen.
      id: 'greenonset',
      kind: 'train',
      routes: ['green'],
      first_seen_ts: NOW - 80 * 60_000,
      resolved_ts: NOW - 4 * 60_000,
      active: false,
      sources: ['bot'],
      official: null,
      observations: [
        {
          id: 502,
          kind: 'train',
          line: 'green',
          from_station: 'EDGEWOOD-CANDLER PARK Station',
          to_station: 'KING MEMORIAL Station',
          detection_source: 'pulse-cold',
          ts: NOW - 10 * 60_000,
          onset_ts: NOW - 80 * 60_000,
          resolved_ts: NOW - 4 * 60_000,
          active: false,
          bot_description:
            'Green Line service appears degraded — a stretch of the line without trains.',
          bot_resolved_description:
            'Trains observed again on the Green Line, service appears to be back to normal.',
          onset_description:
            'Last train observed through this stretch around here — the service gap began about now.',
          post_url: 'https://bsky.app/profile/did:plc:xyz/post/greenonset',
          resolved_post_url: 'https://bsky.app/profile/did:plc:xyz/post/greenonsetclear',
        },
      ],
    },
    {
      id: 'planned-rail',
      kind: 'train',
      routes: ['gold'],
      first_seen_ts: NOW - 60 * 60_000,
      resolved_ts: null,
      active: true,
      sources: ['official'],
      official: officialBlock({
        alert_id: 'planned-rail-1',
        headline: 'Gold Line planned service change',
        short_description:
          'Gold Line trains will use adjusted service this weekend for scheduled maintenance.',
        first_seen_ts: NOW - 60 * 60_000,
        resolved_ts: null,
        active: true,
        agency_event_start_ts: NOW + 2 * 24 * 60 * 60_000,
        agency_event_end_ts: NOW + 3 * 24 * 60 * 60_000,
        post_url: 'https://bsky.app/profile/did:plc:abc/post/planned-rail',
      }),
      observations: [],
    },
  ].map((inc) => incident(inc)),
};

const V2_PAYLOAD = {
  schema_version: 2,
  generated_at: NOW + 1,
  data_start_ts: NOW - 90 * 24 * 60 * 60_000,
  incidents: [
    {
      id: 'v2evt',
      agency: 'official',
      mode: 'train',
      routes: ['red'],
      sources: ['official', 'bot'],
      lifecycle: {
        first_seen_ts: NOW - 60 * 60_000,
        resolved_ts: NOW - 20 * 60_000,
        active: false,
        duration_ms: 40 * 60_000,
      },
      official_alert: {
        id: 'v2-alert',
        headline: 'Red Line Service Delayed',
        description: 'Red Line trains are delayed between Civic Center and Five Points.',
        post_url: 'https://bsky.app/profile/did:plc:abc/post/v2evt',
        resolved_reply_url: null,
        lifecycle: {
          first_seen_ts: NOW - 60 * 60_000,
          resolved_ts: NOW - 20 * 60_000,
          active: false,
          duration_ms: 40 * 60_000,
        },
        scope: {
          from_station: 'CIVIC CENTER Station',
          to_station: 'FIVE POINTS Station',
          stations: ['CIVIC CENTER Station', 'PEACHTREE CENTER Station', 'FIVE POINTS Station'],
          direction: 'southbound',
          mentioned_stations: [],
        },
        agency_event_window: {
          start_ts: null,
          end_ts: null,
          start_is_date_only: false,
          end_is_date_only: false,
        },
      },
      detections: [
        {
          id: 9001,
          source: 'pulse-cold',
          scope: {
            route: 'red',
            from_station: 'CIVIC CENTER Station',
            to_station: 'FIVE POINTS Station',
            stations: ['CIVIC CENTER Station', 'PEACHTREE CENTER Station', 'FIVE POINTS Station'],
            direction: 'branch-0-inbound',
            direction_label: 'southbound',
          },
          lifecycle: {
            first_seen_ts: NOW - 55 * 60_000,
            onset_ts: NOW - 70 * 60_000,
            resolved_ts: NOW - 22 * 60_000,
            active: false,
            duration_ms: 48 * 60_000,
          },
          post_url: 'https://bsky.app/profile/did:plc:xyz/post/v2obs',
          resolved_post_url: null,
          description: 'Red Line service appears degraded — a stretch without trains.',
          evidence: {
            signals: null,
            details: null,
            bullets: [],
            onset_description: 'Last train observed through this stretch around here.',
            train_number: null,
            resolved_description: null,
          },
        },
      ],
      status: null,
    },
  ],
};

beforeEach(() => {
  globalThis.fetch = vi.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve(PAYLOAD) }),
  );
  const store = {};
  vi.stubGlobal('localStorage', {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => {
      store[k] = String(v);
    },
    removeItem: (k) => {
      delete store[k];
    },
    clear: () => {
      for (const k of Object.keys(store)) delete store[k];
    },
  });
  if (!window.matchMedia) {
    window.matchMedia = () => ({
      matches: false,
      addEventListener() {},
      removeEventListener() {},
    });
  }
});

function stubReducedMotion() {
  vi.stubGlobal('matchMedia', (query) => ({
    matches: query === '(prefers-reduced-motion: reduce)',
    addEventListener() {},
    removeEventListener() {},
  }));
}

afterEach(() => {
  // Unmount before restoring globals — EventPage installs a 5-minute
  // setInterval polling fetch, and the closure pins data + station index
  // until React tears the tree down. Without this, each test leaves a
  // multi-MB graph alive and the suite OOMs in CI.
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('EventPage', () => {
  it('renders the matching alert by event id', async () => {
    render(<EventPage eventId="abc123" />);
    await waitFor(() => {
      expect(screen.getByText('Red Line Delays at Five Points')).toBeInTheDocument();
    });
    expect(screen.getByText('View on Bluesky →')).toBeInTheDocument();
    // Breadcrumb replaces the old "← Back" link: Home › <day> › <route>.
    const crumbs = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(within(crumbs).getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(within(crumbs).getByText('Red Line')).toBeInTheDocument();
  });

  it('renders a v2-only incident payload after fetch normalization', async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve(V2_PAYLOAD) }),
    );
    render(<EventPage eventId="v2evt" />);
    await waitFor(() => {
      expect(screen.getByText('Red Line Service Delayed')).toBeInTheDocument();
    });
    expect(screen.getAllByText(/Per MARTA/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Per bot/).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: 'FIVE POINTS Station' }).length).toBeGreaterThan(0);
  });

  it('renders a standalone observation by id', async () => {
    render(<EventPage eventId="bus99" />);
    await waitFor(() => {
      expect(screen.getAllByText('#66 Brownlee Road / Harbin Road').length).toBeGreaterThan(0);
    });
    expect(screen.getByText('ongoing')).toBeInTheDocument();
  });

  it('relabels and de-times a future planned-work alert', async () => {
    render(<EventPage eventId="planned-rail" />);
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Gold Line planned service change/i }),
      ).toBeInTheDocument();
    });
    const article = screen.getByRole('article');
    expect(within(article).getByText('Announced')).toBeInTheDocument();
    expect(within(article).queryByText('First seen')).not.toBeInTheDocument();
    expect(within(article).queryByText('Ongoing for')).not.toBeInTheDocument();
    expect(within(article).getByText('planned')).toBeInTheDocument();
    expect(within(article).queryByText('ongoing')).not.toBeInTheDocument();
  });

  it('shows a not-found message for an unknown id', async () => {
    stubReducedMotion();
    render(<EventPage eventId="missing" />);
    await waitFor(() => {
      expect(screen.getByText(/page not found/i)).toBeInTheDocument();
    });
  });

  it('does not link a station name when it is followed by a geographic suffix', async () => {
    render(<EventPage eventId="redplaza" />);
    await waitFor(() => {
      expect(screen.getByText(/police activity/)).toBeInTheDocument();
    });
    expect(screen.queryByRole('link', { name: /^Five Points Plaza$/ })).toBeNull();
    expect(screen.getAllByRole('link', { name: 'FIVE POINTS Station' }).length).toBeGreaterThan(0);
  });

  it('aggregates affected stations across all merged observations', async () => {
    render(<EventPage eventId="multirail" />);
    await waitFor(() => {
      expect(screen.getByText('Downtown rail service delayed')).toBeInTheDocument();
    });
    expect(screen.getAllByRole('link', { name: 'CIVIC CENTER Station' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: 'ARTS CENTER Station' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: 'FIVE POINTS Station' }).length).toBeGreaterThan(0);
  });

  it('renders the combined multi-line map for a multi-line incident', async () => {
    render(<EventPage eventId="multirail" />);
    await waitFor(() => {
      expect(screen.getByText('Downtown rail service delayed')).toBeInTheDocument();
    });
    expect(
      screen.getByRole('img', { name: /Affected stretches across 2 train lines/ }),
    ).toBeInTheDocument();
    expect(screen.getByText('Affected stations (shared trackage)')).toBeInTheDocument();
    expect(screen.queryByText('Where this happened')).not.toBeInTheDocument();
  });

  it('fans a bot stretch onto sibling lines that share the trackage', async () => {
    render(<EventPage eventId="sharedtrk" />);
    await waitFor(() => {
      expect(
        screen.getByText(
          'Delays between Civic Center and Five Points affecting Red and Gold Line service',
        ),
      ).toBeInTheDocument();
    });
    expect(screen.getByText('Affected stations (shared trackage)')).toBeInTheDocument();
    expect(screen.getAllByText('Red').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Gold').length).toBeGreaterThan(0);
    expect(screen.getByText('Affected stretches')).toBeInTheDocument();
    expect(screen.queryByText('Bot observed impact')).not.toBeInTheDocument();
  });

  it('does not pull in a non-incident line that merely shares the trackage', async () => {
    render(<EventPage eventId="redonly" />);
    await waitFor(() => {
      expect(screen.getByText('Red Line Delays near Civic Center')).toBeInTheDocument();
    });
    const article = within(screen.getByRole('article'));
    expect(article.queryByText('Affected stations (shared trackage)')).not.toBeInTheDocument();
    expect(article.queryByText('Gold')).not.toBeInTheDocument();
    expect(article.queryByText('Gold Line')).not.toBeInTheDocument();
  });

  it('adds a cleared entry to the Per MARTA timeline when the alert resolved', async () => {
    render(<EventPage eventId="redplaza" />);
    await waitFor(() => {
      expect(screen.getByText('MARTA cleared this alert.')).toBeInTheDocument();
    });
    expect(screen.getByText(/Per MARTA · 2 updates/)).toBeInTheDocument();
    expect(screen.getByText(/police activity/)).toBeInTheDocument();
  });

  it('adds an onset entry to the Per bot timeline for a back-dated cold start', async () => {
    // pulse-cold posts only after the stretch has been cold a while, so the
    // detection dot lands well after the gap began. With onset_description +
    // onset_ts the rail gains a third entry at the real start.
    render(<EventPage eventId="greenonset" />);
    await waitFor(() => {
      expect(
        screen.getByText(/Last train observed through this stretch around here/),
      ).toBeInTheDocument();
    });
    // onset (1) + detection (1) + clear (1) = 3 updates.
    expect(screen.getByText(/Per bot · 3 updates/)).toBeInTheDocument();
    // The detection entry carries the ALERTED badge (when the bot raised the
    // alarm); the resolution stays the Latest entry.
    expect(screen.getByText('Alerted')).toBeInTheDocument();
    expect(screen.getByText('Latest')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Trains observed again on the Green Line, service appears to be back to normal.',
      ),
    ).toBeInTheDocument();
  });

  it('does not render a station chips row for bus alerts', async () => {
    // affected_from_station / affected_to_station on bus alerts hold
    // cross-street labels, not rail stations — linking them produces
    // /station/wacker pages with no incidents. The chips are suppressed
    // for kind=bus so the broken links never appear.
    render(<EventPage eventId="busreroute" />);
    await waitFor(() => {
      expect(screen.getByText('Temporary Reroute')).toBeInTheDocument();
    });
    expect(screen.queryByText('Stations')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Baker' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Ellis' })).not.toBeInTheDocument();
  });
});
