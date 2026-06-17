import { describe, expect, it } from 'vitest';
import {
  cancellationInfo,
  cancellationSchedulePhrase,
  cancellationStatusLabel,
} from '../lib/cancellation.js';

// 3:59 PM ET on 2026-06-17 (DST, UTC-4) ≈ this ms.
const DEP_TS = Date.UTC(2026, 5, 17, 19, 59, 0);

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
