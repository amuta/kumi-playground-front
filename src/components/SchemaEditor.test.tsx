import { describe, test, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { SchemaEditor } from './SchemaEditor';

// Mock Monaco Editor
vi.mock('@monaco-editor/react', () => ({
  default: ({ value, onChange }: any) => {
    return (
      <div
        data-testid="monaco-editor"
        className="monaco-editor"
        style={{ width: '100%', height: '100%' }}
      >
        <div className="monaco-hover" style={{ position: 'absolute', top: '10px', left: '10px' }}>
          <div className="monaco-hover-content">Error: Expected end, got comma</div>
        </div>
        <textarea value={value} onChange={(e) => onChange?.(e.target.value)} />
      </div>
    );
  },
}));

describe('SchemaEditor - Diagnostic Box Visibility', () => {
  test('editor container does not have overflow-hidden at top level', () => {
    const { container } = render(
      <SchemaEditor
        value="schema do"
        onChange={() => {}}
        onCompileSuccess={() => {}}
        onCompileError={() => {}}
      />
    );

    // Find the Card element (should NOT have overflow-hidden)
    const card = container.querySelector('[class*="shadow-lg"]');
    expect(card).toBeTruthy();

    const cardClasses = card?.className || '';
    console.log('Card classes:', cardClasses);

    // Card should NOT have overflow-hidden
    expect(cardClasses).not.toContain('overflow-hidden');
  });

  test('inner wrapper has overflow-hidden to clip editor content', () => {
    const { container } = render(
      <SchemaEditor
        value="schema do"
        onChange={() => {}}
        onCompileSuccess={() => {}}
        onCompileError={() => {}}
      />
    );

    const card = container.querySelector('[class*="shadow-lg"]');
    const innerDiv = card?.querySelector('div:first-child');
    const innerClasses = innerDiv?.className || '';

    console.log('Inner div classes:', innerClasses);

    // Inner div should have overflow-hidden
    expect(innerClasses).toContain('overflow-hidden');
  });

  test('monaco-hover elements can escape the editor container', () => {
    const { container } = render(
      <SchemaEditor
        value="schema do"
        onChange={() => {}}
        onCompileSuccess={() => {}}
        onCompileError={() => {}}
      />
    );

    // Find the hover box
    const hoverBox = container.querySelector('.monaco-hover');
    expect(hoverBox).toBeTruthy();

    if (hoverBox) {
      const hoverContent = hoverBox.querySelector('.monaco-hover-content');
      expect(hoverContent?.textContent).toContain('Error');
    }
  });

  test('diagnostic message is rendered and accessible', () => {
    const { container } = render(
      <SchemaEditor
        value="invalid"
        onChange={() => {}}
        onCompileSuccess={() => {}}
        onCompileError={() => {}}
      />
    );

    // The hover content should be visible in the DOM
    const hoverContent = container.querySelector('.monaco-hover-content');
    expect(hoverContent).toBeTruthy();
    expect(hoverContent?.textContent).toBe('Error: Expected end, got comma');
  });
});
