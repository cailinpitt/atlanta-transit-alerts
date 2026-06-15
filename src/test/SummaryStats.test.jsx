import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SummaryStats from '../components/SummaryStats.jsx';

// SummaryStats renders two strips (a mobile card grid + a desktop strip), so
// the same label legitimately appears more than once — assertions use
// getAllByText / queryAllByText accordingly.
const baseProps = {
  activeCount: 2,
  weeklyCount: 5,
  mostAffectedKind: 'train',
  mostAffectedId: 'red',
  quietestLineId: 'yellow',
  quietestLineDays: 10,
  alerts: [],
  observations: [],
};
const HOUR = 60 * 60 * 1000;

function railObservation(kind, line) {
  const now = Date.now();
  return {
    id: `${kind}-${line}`,
    kind,
    line,
    ts: now - HOUR,
    resolved_ts: now,
  };
}

describe('SummaryStats', () => {
  it('renders the 7-day volume figure', () => {
    render(<SummaryStats {...baseProps} />);
    expect(screen.getAllByText('5').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/in last 7 days/i).length).toBeGreaterThan(0);
  });

  it('shows the active-now figure when showActive is set, and hides it otherwise', () => {
    const { rerender } = render(<SummaryStats {...baseProps} showActive />);
    expect(screen.getAllByText(/active now/i).length).toBeGreaterThan(0);

    rerender(<SummaryStats {...baseProps} showActive={false} />);
    expect(screen.queryAllByText(/active now/i)).toHaveLength(0);
    expect(screen.queryAllByText(/all clear/i)).toHaveLength(0);
  });

  it('renders the most-affected train phrase', () => {
    render(<SummaryStats {...baseProps} />);
    expect(screen.getAllByText(/Red Line/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/most affected \(last 30 days\)/i).length).toBeGreaterThan(0);
  });

  it('renders separate MARTA and Commuter most-affected / quietest lines', () => {
    render(
      <SummaryStats
        {...baseProps}
        commuterMostAffectedId="bnsf"
        commuterQuietestLineId="up-n"
        commuterQuietestLineDays={9}
      />,
    );
    expect(screen.getAllByText(/Red Line/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Yellow Line/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/BNSF/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Union Pacific North/).length).toBeGreaterThan(0);
  });

  it('gates the per-agency lines on the agency filter', () => {
    const props = {
      ...baseProps,
      commuterMostAffectedId: 'bnsf',
      commuterQuietestLineId: 'up-n',
      commuterQuietestLineDays: 9,
    };
    const { rerender } = render(<SummaryStats {...props} agency="official" />);
    expect(screen.getAllByText(/Red Line/).length).toBeGreaterThan(0);
    expect(screen.queryAllByText(/BNSF/)).toHaveLength(0);

    rerender(<SummaryStats {...props} agency="commuter" />);
    expect(screen.queryAllByText(/Red Line/)).toHaveLength(0);
    expect(screen.getAllByText(/BNSF/).length).toBeGreaterThan(0);
  });

  it('renders an "all clear" active label when nothing is active', () => {
    render(<SummaryStats {...baseProps} activeCount={0} showActive />);
    expect(screen.getAllByText(/all clear/i).length).toBeGreaterThan(0);
  });

  it('labels MARTA train disruption hours explicitly', () => {
    render(<SummaryStats {...baseProps} observations={[railObservation('train', 'red')]} />);
    expect(screen.getAllByText(/MARTA trains disrupted in last 7 days/i).length).toBeGreaterThan(0);
  });

  it('shows only MARTA disruption cards when scoped to MARTA', () => {
    render(
      <SummaryStats
        {...baseProps}
        agency="official"
        observations={[railObservation('train', 'red'), railObservation('commuter', 'me')]}
      />,
    );
    expect(screen.getAllByText(/MARTA trains disrupted in last 7 days/i).length).toBeGreaterThan(0);
    expect(screen.queryAllByText(/Commuter trains disrupted in last 7 days/i)).toHaveLength(0);
  });

  it('shows only Commuter disruption cards when scoped to Commuter', () => {
    render(
      <SummaryStats
        {...baseProps}
        agency="commuter"
        observations={[railObservation('train', 'red'), railObservation('commuter', 'me')]}
      />,
    );
    expect(screen.queryAllByText(/MARTA trains disrupted in last 7 days/i)).toHaveLength(0);
    expect(screen.getAllByText(/Commuter trains disrupted in last 7 days/i).length).toBeGreaterThan(
      0,
    );
  });
});
