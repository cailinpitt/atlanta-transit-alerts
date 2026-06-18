import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import LinePill from '../components/LinePill.jsx';

describe('LinePill', () => {
  it('normalizes uppercase MARTA rail route keys before rendering', () => {
    render(<LinePill kind="train" routes={['RED']} />);

    const link = screen.getByRole('link', { name: 'Red Line' });
    expect(link).toHaveAttribute('href', '/line/red');
    expect(link).toHaveStyle({ backgroundColor: '#CE242B', color: '#fff' });
    expect(screen.queryByText('RED')).toBeNull();
  });

  it('renders MARTA route A as a bus route, not the streetcar', () => {
    render(<LinePill kind="bus" routes={['A']} />);

    const link = screen.getByRole('link', { name: '#A Rapid A Line' });
    expect(link).toHaveAttribute('href', '/route/A');
    expect(screen.queryByText('Streetcar')).toBeNull();
  });
});
