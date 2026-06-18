import { describe, expect, it } from 'vitest';
import {
  cancellationInfo,
  cancellationSchedulePhrase,
  cancellationStatusLabel,
  collectUpcomingCancellations,
} from '../lib/cancellation.js';

// 3:59 PM ET on 2026-06-17 (DST, UTC-4) ≈ this ms.
const DEP_TS = Date.UTC(2026, 5, 17, 19, 59, 0);
const DAY_MS = 24 * 60 * 60 * 1000;

const cancelledIncident = {
  id: 'rk1',
  routes: ['blue'],
  status: {
    type: 'cancellation',
    state: 'cancelled',
    scheduled_departure_ts: DEP_TS,
    origin: 'Indian Creek',
    line: 'Blue',
    title: '3:59 PM Blue Line departure from Indian Creek cancelled',
  },
};

describe('cancellationInfo', () => {
  it('normalizes a cancelled status block', () => {
    const info = cancellationInfo(cancelledIncident);
    expect(info).toMatchObject({
      state: 'cancelled',
      isCancelled: true,
      isUpcoming: false,
      origin: 'Indian Creek',
      line: 'Blue',
      title: '3:59 PM Blue Line departure from Indian Creek cancelled',
      departureTs: DEP_TS,
    });
  });

  it('flags upcoming state', () => {
    const info = cancellationInfo({
      ...cancelledIncident,
      status: { ...cancelledIncident.status, state: 'upcoming' },
    });
    expect(info.isUpcoming).toBe(true);
    expect(info.isCancelled).toBe(false);
  });

  it('returns null when there is no cancellation status', () => {
    expect(cancellationInfo({ id: 'x', official_alert: { headline: 'Blue Line delays' } })).toBe(
      null,
    );
    expect(cancellationInfo({ id: 'x', status: { type: 'delay' } })).toBe(null);
    expect(cancellationInfo(null)).toBe(null);
  });
});

describe('labels', () => {
  it('cancellationStatusLabel reads upcoming vs cancelled', () => {
    expect(cancellationStatusLabel(cancellationInfo(cancelledIncident))).toBe('cancelled');
    expect(
      cancellationStatusLabel(
        cancellationInfo({
          ...cancelledIncident,
          status: { ...cancelledIncident.status, state: 'upcoming' },
        }),
      ),
    ).toBe('upcoming cancellation');
    expect(cancellationStatusLabel(null)).toBe(null);
  });

  it('cancellationSchedulePhrase renders the departure time', () => {
    const phrase = cancellationSchedulePhrase(cancellationInfo(cancelledIncident));
    expect(phrase).toMatch(/departure$/);
    expect(phrase).toMatch(/3:59/);
  });
});

describe('collectUpcomingCancellations', () => {
  const upcoming = (id, departureTs, extra = {}) => ({
    id,
    routes: ['red'],
    status: {
      type: 'cancellation',
      state: 'upcoming',
      scheduled_departure_ts: departureTs,
      origin: 'Airport',
      line: 'Red',
      title: `${id} cancelled`,
      ...extra,
    },
  });

  it('returns upcoming departures still ahead of now, soonest first', () => {
    const now = DEP_TS;
    const items = collectUpcomingCancellations(
      [upcoming('b', now + 30 * 60_000), upcoming('a', now + 10 * 60_000)],
      { now },
    );
    expect(items.map((i) => i.id)).toEqual(['a', 'b']);
    expect(items[0]).toMatchObject({
      line: 'red',
      origin: 'Airport',
      departureTs: now + 10 * 60_000,
    });
  });

  it('drops departures whose scheduled time has already passed', () => {
    const now = DEP_TS;
    const items = collectUpcomingCancellations([upcoming('past', now - 60_000)], { now });
    expect(items).toEqual([]);
  });

  it('ignores already-cancelled and non-cancellation incidents', () => {
    const now = DEP_TS;
    const items = collectUpcomingCancellations(
      [cancelledIncident, { id: 'plain', routes: ['red'], status: { type: 'delay' } }],
      { now: now - DAY_MS },
    );
    expect(items).toEqual([]);
  });
});
