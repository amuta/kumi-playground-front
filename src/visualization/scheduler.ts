export interface IScheduler {
  set(ms: number, cb: () => void): number;
  clear(id: number | null): void;
}

export class WindowScheduler implements IScheduler {
  set(ms: number, cb: () => void): number {
    return window.setTimeout(cb, ms);
  }
  clear(id: number | null): void {
    if (id != null) window.clearTimeout(id);
  }
}

export const windowScheduler = new WindowScheduler();
