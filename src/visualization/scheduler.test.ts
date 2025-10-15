import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WindowScheduler } from './scheduler';

describe('WindowScheduler', () => {
  let scheduler: WindowScheduler;

  beforeEach(() => {
    vi.useFakeTimers();
    scheduler = new WindowScheduler();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('schedules a callback and runs it after delay', () => {
    const cb = vi.fn();
    const id = scheduler.set(100, cb);

    expect(id).toBeTruthy();
    expect(cb).not.toHaveBeenCalled();

    vi.advanceTimersByTime(99);
    expect(cb).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('clear prevents a scheduled callback from running', () => {
    const cb = vi.fn();
    const id = scheduler.set(100, cb);
    scheduler.clear(id);

    vi.advanceTimersByTime(200);
    expect(cb).not.toHaveBeenCalled();
  });

  it('clear with null is a no-op', () => {
    // @ts-expect-no-error
    scheduler.clear(null as unknown as number);
    expect(true).toBe(true);
  });
});
