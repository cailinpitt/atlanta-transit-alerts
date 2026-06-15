import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import SubscribeContent from '../components/SubscribeContent.jsx';

describe('SubscribeContent feed picker', () => {
  it('defaults to the Red Line feed URL', () => {
    render(<SubscribeContent />);
    expect(
      screen.getByDisplayValue('https://atlantatransitalerts.app/feed/line/red.xml'),
    ).toBeInTheDocument();
  });

  it('updates the feed URL when a bus route is picked', async () => {
    render(<SubscribeContent />);
    await userEvent.selectOptions(screen.getByLabelText('MARTA line or route'), 'route/66');
    expect(
      screen.getByDisplayValue('https://atlantatransitalerts.app/feed/route/66.xml'),
    ).toBeInTheDocument();
  });

  it('updates the feed URL when a Commuter line is picked', async () => {
    render(<SubscribeContent />);
    await userEvent.selectOptions(screen.getByLabelText('Commuter line'), 'commuter/line/bnsf');
    expect(
      screen.getByDisplayValue('https://atlantatransitalerts.app/feed/commuter/line/bnsf.xml'),
    ).toBeInTheDocument();
  });
});
