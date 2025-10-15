import { describe, it, expect, vi } from 'vitest';
import { VisualizationController, type IScheduler } from './controller';

function makeEngine(start = 0) {
  let count = start;
  return {
    snapshot: () => ({ stepCount: count, input: {}, outputs: null, error: null }),
    step: () => ({ stepCount: ++count, input: {}, outputs: { ok: count }, error: null }),
    setInput: vi.fn(),
  };
}

/** Scheduler that deletes a task when it fires, like real timers do */
function makeSchedulerCapture() {
  let next = 1;
  const tasks = new Map<number, () => void>();
  const scheduler: IScheduler = {
    set: (_ms, fn) => {
      const id = next++;
      const wrapped = () => {
        tasks.delete(id);   // important: remove fired task
        fn();
      };
      tasks.set(id, wrapped);
      return id;
    },
    clear: (id) => {
      if (id != null) tasks.delete(id as number);
    },
  };
  return { scheduler, tasks };
}

describe('VisualizationController', () => {
  it('play uses scheduler and advances', async () => {
    const { scheduler, tasks } = makeSchedulerCapture();
    const ctrl = new VisualizationController(scheduler);
    const eng = makeEngine(0);

    let steps = 0;
    ctrl.onUpdate = (s) => { steps = s.stepCount; };

    await ctrl.init({ engine: eng });

    ctrl.play(10);
    expect(ctrl.isPlaying).toBe(true);
    expect(steps).toBe(0);
    expect(tasks.size).toBe(1);

    // first tick
    const [tid1] = Array.from(tasks.keys());
    tasks.get(tid1)!();
    expect(steps).toBe(1);
    expect(tasks.size).toBe(1); // next tick queued, previous removed

    // second tick
    const [tid2] = Array.from(tasks.keys());
    tasks.get(tid2)!();
    expect(steps).toBe(2);
    expect(tasks.size).toBe(1);

    ctrl.pause();
    expect(ctrl.isPlaying).toBe(false);
    expect(tasks.size).toBe(0);
  });

  it('handles missing engine with error on step', async () => {
    const { scheduler } = makeSchedulerCapture();
    const ctrl = new VisualizationController(scheduler);
    await ctrl.init({ engine: undefined as any });

    let gotError = '';
    ctrl.onError = (e) => { gotError = e; };

    ctrl.step();
    expect(gotError).toMatch(/engine not initialized/i);
  });
});
