import { describe, expect, it } from 'vitest';
import { buildLineMap } from '../lib/lineMap.js';

const ALL_LINES = ['red', 'gold', 'blue', 'green', 'streetcar'];

describe('buildLineMap orientation', () => {
  it('renders every single line landscape on desktop', () => {
    // The desktop map rotates any taller-than-wide line 90° so all lines read
    // horizontally — a portrait N-S line (Red, Gold) is harder to read and
    // wastes the wide content column. Every line should come back width ≥ height.
    for (const line of ALL_LINES) {
      const map = buildLineMap(line, null, { maxWidth: 720, maxHeight: 540 });
      expect(map, line).toBeTruthy();
      expect(map.width, line).toBeGreaterThanOrEqual(map.height);
    }
  });

  it('keeps the long axis vertical in portrait (mobile) mode', () => {
    // preferPortrait flips the rule: stand the line up so a phone's height does
    // the work. A long line should then be taller than wide.
    const map = buildLineMap('gold', null, { maxWidth: 720, maxHeight: 540, preferPortrait: true });
    expect(map.height).toBeGreaterThanOrEqual(map.width);
  });
});
