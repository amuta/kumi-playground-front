export interface IScheduler {
  set(ms: number, cb: () => void): number; // one-shot
  clear(id: number | null): void;
}

// Test-friendly timeout scheduler (advances with vitest fake timers)
export class WindowScheduler implements IScheduler {
  set(ms: number, cb: () => void): number {
    return window.setTimeout(cb, Math.max(0, ms));
  }
  clear(id: number | null): void {
    if (id != null) window.clearTimeout(id);
  }
}

// rAF one-shot scheduler for runtime smoothness
class RafTimeoutScheduler implements IScheduler {
  private tasks = new Map<number, { id: number; due: number; cb: () => void }>();
  private nextId = 1;
  private rafId: number | null = null;

  set(ms: number, cb: () => void): number {
    const id = this.nextId++;
    const due = performance.now() + Math.max(0, ms);
    this.tasks.set(id, { id, due, cb });
    this.start();
    return id;
  }

  clear(id: number | null): void {
    if (id == null) return;
    this.tasks.delete(id);
    if (this.tasks.size === 0) this.stop();
  }

  private start() {
    if (this.rafId != null) return;
    const loop = (ts: number) => {
      for (const [id, t] of this.tasks) {
        if (ts >= t.due) {
          this.tasks.delete(id);
          try { t.cb(); } catch {}
        }
      }
      if (this.tasks.size === 0) { this.stop(); return; }
      this.rafId = window.requestAnimationFrame(loop);
    };
    this.rafId = window.requestAnimationFrame(loop);
  }

  private stop() {
    if (this.rafId != null) {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}

// Use rAF at runtime, but tests can import WindowScheduler directly.
export const windowScheduler: IScheduler =
  typeof window !== 'undefined' && 'requestAnimationFrame' in window
    ? new RafTimeoutScheduler()
    : new WindowScheduler();
