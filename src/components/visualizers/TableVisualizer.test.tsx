import { render, screen } from '@testing-library/react';
import { TableVisualizer } from './TableVisualizer';

describe('TableVisualizer', () => {
  it('renders array as ASCII table', () => {
    const value = [1, 2, 3];

    render(<TableVisualizer name="numbers" value={value} />);

    expect(screen.getByText('numbers')).toBeInTheDocument();
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    expect(screen.getByText('index')).toBeInTheDocument();
  });

  it('shows error for non-array values', () => {
    const value = { not: 'array' };

    render(<TableVisualizer name="invalid" value={value} />);

    expect(screen.getByText(/Cannot render as table/)).toBeInTheDocument();
  });

  it('handles empty arrays', () => {
    render(<TableVisualizer name="empty" value={[]} />);

    expect(screen.getByText('empty')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('renders record arrays with column headers', () => {
    const value = [
      { scenario: 'A', runs: 10, mean: 1.2 },
      { scenario: 'B', runs: 5, mean: 0.9 },
    ];

    render(<TableVisualizer name="summary" value={value} />);

    expect(screen.getByText('summary')).toBeInTheDocument();
    expect(screen.getByText('scenario')).toBeInTheDocument();
    expect(screen.getByText('runs')).toBeInTheDocument();
  });
});
