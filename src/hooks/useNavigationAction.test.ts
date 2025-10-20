import { describe, test, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useNavigationAction } from './useNavigationAction';

describe('useNavigationAction', () => {
  test('returns compile action on schema tab', () => {
    const { result } = renderHook(() =>
      useNavigationAction({
        activeTab: 'schema',
        executeTabSubTab: 'input',
        canVisualize: false,
        isCompiling: false,
        isExecuting: false,
        isVisualizePlaying: false,
      })
    );

    expect(result.current.action).toBe('compile');
    expect(result.current.label).toBe('Compile');
  });

  test('returns setInputs action on codegen tab when visualization is available', () => {
    const { result } = renderHook(() =>
      useNavigationAction({
        activeTab: 'compiled',
        executeTabSubTab: 'input',
        canVisualize: true,
        isCompiling: false,
        isExecuting: false,
        isVisualizePlaying: false,
      })
    );

    expect(result.current.action).toBe('visualize');
  });

  test('returns execute action on codegen tab when visualization is not available', () => {
    const { result } = renderHook(() =>
      useNavigationAction({
        activeTab: 'compiled',
        executeTabSubTab: 'input',
        canVisualize: false,
        isCompiling: false,
        isExecuting: false,
        isVisualizePlaying: false,
      })
    );

    expect(result.current.action).toBe('execute');
  });

  test('returns call action on execute tab with input subtab', () => {
    const { result } = renderHook(() =>
      useNavigationAction({
        activeTab: 'execute',
        executeTabSubTab: 'input',
        canVisualize: false,
        isCompiling: false,
        isExecuting: false,
        isVisualizePlaying: false,
      })
    );

    expect(result.current.action).toBe('call');
    expect(result.current.label).toBe('Call');
  });

  test('returns changeInputs action on execute tab with output subtab', () => {
    const { result } = renderHook(() =>
      useNavigationAction({
        activeTab: 'execute',
        executeTabSubTab: 'output',
        canVisualize: false,
        isCompiling: false,
        isExecuting: false,
        isVisualizePlaying: false,
      })
    );

    expect(result.current.action).toBe('changeInputs');
    expect(result.current.label).toBe('Change Inputs');
  });

  test('returns play action on visualize tab when not playing', () => {
    const { result } = renderHook(() =>
      useNavigationAction({
        activeTab: 'visualize',
        executeTabSubTab: 'input',
        canVisualize: true,
        isCompiling: false,
        isExecuting: false,
        isVisualizePlaying: false,
      })
    );

    expect(result.current.action).toBe('play');
    expect(result.current.label).toBe('Play');
  });

  test('returns pause action on visualize tab when playing', () => {
    const { result } = renderHook(() =>
      useNavigationAction({
        activeTab: 'visualize',
        executeTabSubTab: 'input',
        canVisualize: true,
        isCompiling: false,
        isExecuting: false,
        isVisualizePlaying: true,
      })
    );

    expect(result.current.action).toBe('pause');
    expect(result.current.label).toBe('Pause');
  });

  test('disables action when compiling on schema tab', () => {
    const { result } = renderHook(() =>
      useNavigationAction({
        activeTab: 'schema',
        executeTabSubTab: 'input',
        canVisualize: false,
        isCompiling: true,
        isExecuting: false,
        isVisualizePlaying: false,
      })
    );

    expect(result.current.disabled).toBe(true);
  });

  test('disables action when executing on execute tab', () => {
    const { result } = renderHook(() =>
      useNavigationAction({
        activeTab: 'execute',
        executeTabSubTab: 'input',
        canVisualize: false,
        isCompiling: false,
        isExecuting: true,
        isVisualizePlaying: false,
      })
    );

    expect(result.current.disabled).toBe(true);
  });

  test('does not disable play/pause on visualize tab', () => {
    const { result } = renderHook(() =>
      useNavigationAction({
        activeTab: 'visualize',
        executeTabSubTab: 'input',
        canVisualize: true,
        isCompiling: false,
        isExecuting: true,
        isVisualizePlaying: false,
      })
    );

    expect(result.current.disabled).toBe(false);
  });

  test('returns isLoading based on context', () => {
    const { result: compilingResult } = renderHook(() =>
      useNavigationAction({
        activeTab: 'schema',
        executeTabSubTab: 'input',
        canVisualize: false,
        isCompiling: true,
        isExecuting: false,
        isVisualizePlaying: false,
      })
    );

    expect(compilingResult.current.isLoading).toBe(true);

    const { result: executingResult } = renderHook(() =>
      useNavigationAction({
        activeTab: 'execute',
        executeTabSubTab: 'input',
        canVisualize: false,
        isCompiling: false,
        isExecuting: true,
        isVisualizePlaying: false,
      })
    );

    expect(executingResult.current.isLoading).toBe(true);
  });
});
