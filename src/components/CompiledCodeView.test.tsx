import { render, screen } from '@testing-library/react';
import { describe, test, vi, expect } from 'vitest';

vi.mock('@monaco-editor/react', () => ({
  default: () => <div>Monaco Editor</div>,
}));

import { CompiledCodeView } from './CompiledCodeView';

describe('CompiledCodeView', () => {
  const mockResult = {
    artifact_url: 'https://example.com/artifact.js',
    js_src: 'function _sum() {}',
    ruby_src: 'def sum; end',
    lir: 'sum: () -> int',
    schema_hash: 'abc123',
    input_form_schema: {},
    output_schema: {},
  };

  test('renders code tabs', () => {
    render(<CompiledCodeView result={mockResult} />);

    expect(screen.getByRole('tab', { name: /JavaScript/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Ruby/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /LIR/i })).toBeInTheDocument();
  });
});
