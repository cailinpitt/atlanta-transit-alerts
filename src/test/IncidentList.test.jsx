import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import IncidentList from '../components/IncidentList.jsx';
import { incident } from './v2TestHelpers.js';

const NOW = 1_000_000_000_000;

// Nested incident wire shape: top-level id/kind/routes, a nullable `official` block,
// and an `observations[]` list.
const obsRecord = (over = {}) => ({
  id: 1,
  kind: 'train',
  line: 'red',
  from_station: 'CIVIC CENTER Station',
  to_station: 'FIVE POINTS Station',
  ts: NOW - 55 * 60_000,
  resolved_ts: NOW - 30 * 60_000,
  active: false,
  post_url: 'https://bsky.app/obs',
  ...over,
});

const alertInc = (over = {}) =>
  incident({
    id: 'alert1',
    kind: 'train',
    routes: ['red'],
    first_seen_ts: NOW - 60 * 60_000,
    resolved_ts: NOW - 30 * 60_000,
    active: false,
    official: {
      alert_id: 'a1',
      headline: 'Red Line Delays',
      post_url: 'https://bsky.app/alert',
      first_seen_ts: NOW - 60 * 60_000,
    },
    observations: [],
    ...over,
  });

const obsInc = (over = {}) =>
  incident({
    id: 'obs1',
    kind: 'train',
    routes: ['red'],
    first_seen_ts: NOW - 55 * 60_000,
    resolved_ts: NOW - 30 * 60_000,
    active: false,
    official: null,
    observations: [obsRecord()],
    ...over,
  });

const mergedInc = (over = {}) =>
  incident({
    id: 'm1',
    kind: 'train',
    routes: ['red'],
    first_seen_ts: NOW - 60 * 60_000,
    resolved_ts: NOW - 30 * 60_000,
    active: false,
    official: {
      alert_id: 'a1',
      headline: 'Red Line Delays',
      post_url: 'https://bsky.app/alert',
      first_seen_ts: NOW - 60 * 60_000,
    },
    observations: [obsRecord()],
    ...over,
  });

describe('IncidentList', () => {
  it('shows empty state when there are no incidents', () => {
    render(<IncidentList incidents={[]} />);
    expect(screen.getByText(/no incidents/i)).toBeInTheDocument();
  });

  it('shows "via MARTA" tag for MARTA-only incidents', () => {
    render(<IncidentList incidents={[alertInc()]} />);
    expect(screen.getByText('via MARTA')).toBeInTheDocument();
  });

  it('shows "via auto-detection" tag for bot-only incidents', () => {
    render(<IncidentList incidents={[obsInc()]} />);
    expect(screen.getByText('via auto-detection')).toBeInTheDocument();
  });

  it('shows both tags for a merged incident', () => {
    render(<IncidentList incidents={[mergedInc()]} />);
    expect(screen.getByText('via MARTA')).toBeInTheDocument();
    expect(screen.getByText('via auto-detection')).toBeInTheDocument();
  });

  it('shows both Bluesky links for a merged incident', () => {
    render(<IncidentList incidents={[mergedInc()]} />);
    expect(screen.getByText('Via MARTA →')).toBeInTheDocument();
    expect(screen.getByText('Bot detection (gap) →')).toBeInTheDocument();
  });

  it('shows the station segment for a merged incident', () => {
    render(<IncidentList incidents={[mergedInc()]} />);
    expect(screen.getByText('Civic Center Station')).toBeInTheDocument();
    expect(screen.getByText('Five Points Station')).toBeInTheDocument();
  });

  it('shows the affected station segment as a subtitle for a pure official train alert', () => {
    const seg = alertInc({
      official: {
        alert_id: 'a1',
        headline: 'Green Line partial service',
        post_url: 'https://bsky.app/alert',
        first_seen_ts: NOW - 60 * 60_000,
        from_station: 'BANKHEAD Station',
        to_station: 'ASHBY Station',
      },
    });
    render(<IncidentList incidents={[seg]} />);
    expect(screen.getByText('Bankhead Station')).toBeInTheDocument();
    expect(screen.getByText('Ashby Station')).toBeInTheDocument();
  });

  it('shows "ongoing" badge for active incidents', () => {
    render(<IncidentList incidents={[alertInc({ resolved_ts: null, active: true })]} />);
    expect(screen.getByText('ongoing')).toBeInTheDocument();
  });

  it('uses the cancellation title and badge for a single-departure cancellation', () => {
    const cancelInc = alertInc({
      id: 'cancel1',
      routes: ['gold'],
      official: {
        alert_id: 'a-cancel',
        headline: 'Rail Service Alert for Gold Line',
        post_url: 'https://bsky.app/alert',
        first_seen_ts: NOW - 60 * 60_000,
      },
      cancellation: {
        state: 'cancelled',
        line: 'Gold',
        origin: 'Doraville',
        scheduled_departure_ts: NOW - 65 * 60_000,
        title: '11:41 AM Gold Line departure from Doraville cancelled',
      },
    });
    render(<IncidentList incidents={[cancelInc]} />);
    // Title prefers the structured cancellation phrase over MARTA's vague headline.
    expect(
      screen.getByText('11:41 AM Gold Line departure from Doraville cancelled'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Rail Service Alert for Gold Line')).not.toBeInTheDocument();
    // And the right-hand badge reads "cancelled", not "ongoing".
    expect(screen.getByText('cancelled')).toBeInTheDocument();
  });

  it('keeps plain durations in the metadata line, not the right-side badge column', () => {
    const { container } = render(<IncidentList incidents={[obsInc()]} />);
    expect(screen.getByText('~25m duration')).toBeInTheDocument();
    const rightBadgeColumn = container.querySelector('.flex-shrink-0.text-right.whitespace-nowrap');
    expect(rightBadgeColumn).toBeNull();
  });

  it('shows a streetcar route pill for a streetcar observation', () => {
    const streetcarInc = incident({
      id: 'streetcar-1',
      kind: 'train',
      routes: ['streetcar'],
      first_seen_ts: NOW,
      resolved_ts: NOW,
      active: false,
      official: null,
      observations: [
        {
          id: 'streetcar-1',
          kind: 'train',
          line: 'streetcar',
          from_station: 'Centennial Olympic Park',
          to_station: 'King Historic District',
          detection_source: 'bunching',
          ts: NOW,
          resolved_ts: NOW,
          active: false,
          bot_description: 'Streetcars bunched downtown',
        },
      ],
    });
    render(<IncidentList incidents={[streetcarInc]} />);
    expect(screen.getByText('Streetcar')).toBeInTheDocument();
    expect(screen.getByText('Centennial Olympic Park')).toBeInTheDocument();
    expect(screen.getByText('King Historic District')).toBeInTheDocument();
  });

  it('shows a bus route name for a bus observation', () => {
    const busInc = incident({
      id: 'bus-66',
      kind: 'bus',
      routes: ['66'],
      first_seen_ts: NOW,
      resolved_ts: NOW,
      active: false,
      official: null,
      observations: [
        {
          id: 'bus-66',
          kind: 'bus',
          line: '66',
          from_station: null,
          to_station: null,
          detection_source: 'gap',
          ts: NOW,
          resolved_ts: NOW,
          active: false,
          bot_description: 'Long gaps detected',
        },
      ],
    });
    render(<IncidentList incidents={[busInc]} />);
    expect(screen.getByText('#66 Brownlee Road / Harbin Road')).toBeInTheDocument();
    expect(screen.getByText('Long gaps')).toBeInTheDocument();
  });

  it('shows load more button when incidents exceed page size', () => {
    const incidents = Array.from({ length: 26 }, (_, i) =>
      alertInc({ id: `a${i + 1}`, first_seen_ts: NOW - (i + 1) * 60_000 }),
    );
    render(<IncidentList incidents={incidents} />);
    expect(screen.getByText(/load more/i)).toBeInTheDocument();
  });

  it('loads more incidents when load more is clicked', async () => {
    const incidents = Array.from({ length: 26 }, (_, i) =>
      alertInc({ id: `a${i + 1}`, first_seen_ts: NOW - (i + 1) * 60_000 }),
    );
    render(<IncidentList incidents={incidents} />);
    await userEvent.click(screen.getByText(/load more/i));
    expect(screen.queryByText(/load more/i)).not.toBeInTheDocument();
  });
});
