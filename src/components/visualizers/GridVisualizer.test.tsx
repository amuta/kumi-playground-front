import { render, screen } from '@testing-library/react';
import { GridVisualizer } from './GridVisualizer';

describe('GridVisualizer', () => {
  it('renders 2D array as ASCII grid', () => {
    const value = [[1, 2], [3, 4]];

    render(<GridVisualizer name="matrix" value={value} />);

    expect(screen.getByText('matrix')).toBeInTheDocument();
    const pre = screen.getByRole('group');
    expect(pre).toHaveClass('font-mono');
  });

  it('shows error for non-2D array', () => {
    const value = [1, 2, 3];

    render(<GridVisualizer name="invalid" value={value} />);

    expect(screen.getByText(/Cannot render as grid/)).toBeInTheDocument();
  });

  it('shows error for non-array', () => {
    const value = { not: 'array' };

    render(<GridVisualizer name="invalid" value={value} />);

    expect(screen.getByText(/Cannot render as grid/)).toBeInTheDocument();
  });
});
