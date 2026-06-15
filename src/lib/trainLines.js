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
