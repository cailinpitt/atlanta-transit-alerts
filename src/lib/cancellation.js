// Display helpers for MARTA single-departure rail cancellations.
//
// The insights export (bin/marta/export-web.js) ships a top-level `status`
// object on an incident when a MARTA rail alert's prose names a specific
// cancelled departure. It's an incident-level fact, not alert metadata, and
// carries the rider-facing title + the server-computed lifecycle state — so the
// frontend stays a dumb renderer: no clock math, no "is it past?" logic here.
//
// Lifecycle (set server-side):
//   'upcoming'  — announced, before the cancelled departure's scheduled time
//   'cancelled' — the scheduled departure has passed; terminal
//
// MARTA analog of cta-alert-history/src/lib/cancellation.js. Unlike Metra (which
// resolves an annulled train against the GTFS timetable and so carries a train
// number + arrival), MARTA gives us only prose — so the block carries the
// parsed departure time, origin, line, and a prebuilt title, and there's no
// train-number/arrival concept.
//
// Vague reduced-service / single-tracking alerts that name no specific cancelled
// departure carry no `status` block and keep the ordinary ongoing→resolved
// status.

import { formatTime } from './format.js';

/**
 * Normalize an incident's cancellation status, or null when it isn't a
 * single-departure cancellation.
 * @param {object} incident
 * @returns {{state:string,isUpcoming:boolean,isCancelled:boolean,departureTs:number|null,origin:string|null,line:string|null,title:string|null}|null}
 */
export function cancellationInfo(incident) {
  const c = incident?.status?.type === 'cancellation' ? incident.status : null;
  if (!c?.state) return null;
  return {
    state: c.state,
    isUpcoming: c.state === 'upcoming',
    isCancelled: c.state === 'cancelled',
    departureTs: c.scheduled_departure_ts ?? null,
    origin: c.origin ?? null,
    line: c.line ?? null,
    title: c.title ?? null,
  };
}

/** Short status-pill label, e.g. 'upcoming cancellation' / 'cancelled'. */
export function cancellationStatusLabel(info) {
  if (!info) return null;
  return info.isUpcoming ? 'upcoming cancellation' : 'cancelled';
}

/**
 * Rider-facing scheduled-departure phrase, e.g. "3:59 PM departure". Null when
 * no scheduled time is known.
 */
export function cancellationSchedulePhrase(info) {
  if (!info || info.departureTs == null) return null;
  return `${formatTime(info.departureTs)} departure`;
}
