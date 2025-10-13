import { render, screen } from '@testing-library/react';
import { InlineValue } from './InlineValue';

describe('InlineValue', () => {
  it('renders simple values inline', () => {
    render(<InlineValue name="sum" value={42} />);

    expect(screen.getByText('sum:')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('stringifies complex values', () => {
    render(<InlineValue name="result" value={{ x: 10 }} />);

    expect(screen.getByText('result:')).toBeInTheDocument();
    expect(screen.getByText('{"x":10}')).toBeInTheDocument();
  });

  it('handles null and undefined', () => {
    const { rerender } = render(<InlineValue name="test" value={null} />);
    expect(screen.getByText('null')).toBeInTheDocument();

    rerender(<InlineValue name="test" value={undefined} />);
    expect(screen.getByText('undefined')).toBeInTheDocument();
  });
});
