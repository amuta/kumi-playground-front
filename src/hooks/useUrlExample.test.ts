import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUrlExample } from './useUrlExample';
import type { Example } from '@/types';

const example1: Example = {
  id: 'arithmetic',
  title: 'Arithmetic',
  mode: 'notebook',
  schema_src: 'schema do\n  value :x, 1\nend',
};

const example2: Example = {
  id: 'game-of-life',
  title: 'Game of Life',
  mode: 'notebook',
  schema_src: 'schema do\n  value :y, 2\nend',
};

const examples = [example1, example2];

describe('useUrlExample', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', window.location.pathname);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('returns default example when no query param', () => {
    const { result } = renderHook(() => useUrlExample(examples));

    expect(result.current[0].id).toBe(example1.id);
  });

  test('returns example from URL query param', () => {
    window.history.replaceState({}, '', '?example=game-of-life');

    const { result } = renderHook(() => useUrlExample(examples));

    expect(result.current[0].id).toBe(example2.id);
  });

  test('returns default example for invalid ID', () => {
    window.history.replaceState({}, '', '?example=invalid-id');

    const { result } = renderHook(() => useUrlExample(examples));

    expect(result.current[0].id).toBe(example1.id);
  });

  test('updates URL when example changes', () => {
    const { result } = renderHook(() => useUrlExample(examples));

    act(() => {
      result.current[1](example2);
    });

    expect(window.location.search).toBe('?example=game-of-life');
  });

  test('keeps other query params when updating example', () => {
    window.history.replaceState({}, '', '?foo=bar');

    const { result } = renderHook(() => useUrlExample(examples));

    act(() => {
      result.current[1](example2);
    });

    const url = new URL(window.location.href);
    expect(url.searchParams.get('example')).toBe('game-of-life');
    expect(url.searchParams.get('foo')).toBe('bar');
  });

  test('handles popstate event to read URL', () => {
    const { result, rerender } = renderHook(() => useUrlExample(examples));

    expect(result.current[0].id).toBe(example1.id);

    act(() => {
      window.history.replaceState({}, '', '?example=game-of-life');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    rerender();

    expect(result.current[0].id).toBe(example2.id);
  });

  test('handles empty example param as default', () => {
    window.history.replaceState({}, '', '?example=');

    const { result } = renderHook(() => useUrlExample(examples));

    expect(result.current[0].id).toBe(example1.id);
  });

  test('updates URL on initial mount with default example', () => {
    window.history.replaceState({}, '', '');

    renderHook(() => useUrlExample(examples));

    expect(window.location.search).toBe('?example=arithmetic');
  });

  test('updates URL on initial mount when query param specified', () => {
    window.history.replaceState({}, '', '?example=game-of-life');

    renderHook(() => useUrlExample(examples));

    expect(window.location.search).toBe('?example=game-of-life');
  });
});
