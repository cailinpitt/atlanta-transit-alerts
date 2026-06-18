// MARTA rail/streetcar line metadata, keyed by the normalized route key used
// in alerts.json. The filename remains trainLines.js for now to keep the port
// scoped; callers import TRAIN_LINES rather than MARTA-specific names.
export const TRAIN_LINES = {
  blue: { label: 'Blue', color: '#0075B2', textColor: '#fff' },
  gold: { label: 'Gold', color: '#D4A723', textColor: '#111827' },
  green: { label: 'Green', color: '#009D4B', textColor: '#fff' },
  red: { label: 'Red', color: '#CE242B', textColor: '#fff' },
  streetcar: { label: 'Streetcar', color: '#8B5CF6', textColor: '#fff' },
};

// Order determines row order in the timeline grid.
export const TRAIN_LINE_ORDER = ['blue', 'gold', 'green', 'red', 'streetcar'];

// Streetcar is keyed only by its real identifiers (ATLSC/SC → `streetcar`).
// Route "A" is deliberately NOT mapped here: it's the Rapid A Line BRT
// (GTFS route_type 3, a bus — see busRoutes.js), not the streetcar. Mapping it
// to `streetcar` previously misrendered Rapid A as a rail line and hid it from
// the bus roster.
const LINE_ALIAS = {
  BLUE: 'blue',
  GOLD: 'gold',
  GREEN: 'green',
  RED: 'red',
  ATLSC: 'streetcar',
  atlsc: 'streetcar',
};

/**
 * Normalize a MARTA rail/streetcar route key. Unknown keys pass through
 * unchanged so stale links fail soft.
 *
 * @param {string} key
 * @returns {string}
 */
export function normalizeTrainLine(key) {
  if (key == null) return key;
  return LINE_ALIAS[key] ?? key;
}

export function isStreetcarRoute(key) {
  return normalizeTrainLine(key) === 'streetcar';
}
