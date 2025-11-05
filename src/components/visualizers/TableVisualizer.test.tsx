import { render, screen } from '@testing-library/react';
import { TableVisualizer } from './TableVisualizer';

describe('TableVisualizer', () => {
  it('renders array as ASCII table', () => {
    const value = [1, 2, 3];

    render(<TableVisualizer name="numbers" value={value} />);

    expect(screen.getByText('numbers')).toBeInTheDocument();
    const pre = screen.getByRole('group');
    expect(pre).toHaveClass('font-mono');
  });

  it('shows error for non-array values', () => {
    const value = { not: 'array' };

    render(<TableVisualizer name="invalid" value={value} />);

    expect(screen.getByText(/Cannot render as table/)).toBeInTheDocument();
  });

  it('handles empty arrays', () => {
    render(<TableVisualizer name="empty" value={[]} />);

    expect(screen.getByText('empty')).toBeInTheDocument();
  });
});
