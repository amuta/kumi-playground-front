import type { EngineSnapshot } from './engine';
import { windowScheduler, type IScheduler } from './scheduler';

type EngineLike = {
  snapshot: () => EngineSnapshot;
  // allow sync or async step implementations (main thread vs worker proxy)
  step: () => EngineSnapshot | Promise<EngineSnapshot>;
  setInput?: (v: Record<string, any>) => void;
};

export class VisualizationController {
  private engine: EngineLike | null = null;
  private playing = false;
  private speed = 250;
  private timerId: number | null = null;
  private scheduler: IScheduler;
  private subs = new Set<() => void>();
  private last: EngineSnapshot = { stepCount: 0, input: {}, outputs: null, error: null };

  // Back-compat callbacks used by VisualizeTab
  onUpdate?: (snapshot: EngineSnapshot) => void;
  onError?: (message: string) => void;

  constructor(scheduler?: IScheduler) {
    this.scheduler = scheduler ?? windowScheduler;
  }

  get isPlaying() { return this.playing; }
  get stepCount()  { return this.last.stepCount; }
  get outputs()    { return this.last.outputs; }
  get error()      { return this.last.error; }

  onChange(cb: () => void) {
    this.subs.add(cb);
    return () => this.subs.delete(cb);
  }
  private emit() {
    this.subs.forEach(cb => { try { cb(); } catch {} });
    this.onUpdate?.(this.last);
    if (this.last.error) this.onError?.(this.last.error);
  }

  async init(opts: { engine?: EngineLike; baseInput?: Record<string, any> }) {
    this.engine = opts.engine ?? null;
    if (!this.engine) {
      this.last = { stepCount: 0, input: {}, outputs: null, error: 'Engine not initialized' };
      this.emit();
      return;
    }
    if (opts.baseInput && this.engine.setInput) this.engine.setInput(opts.baseInput);
    this.last = await Promise.resolve(this.engine.snapshot());
    this.emit();
  }

  setInput(v: Record<string, any>) {
    if (!this.engine?.setInput) return;
    this.engine.setInput(v);
    // snapshot is always sync
    this.last = this.engine.snapshot();
    this.emit();
  }

  step() {
    if (!this.engine) {
      this.last = { ...this.last, error: 'Engine not initialized' };
      this.emit();
      return;
    }
    const res = this.engine.step();
    // handle async worker proxy
    if (res && typeof (res as any).then === 'function') {
      (res as Promise<EngineSnapshot>)
        .then(snap => { this.last = snap; this.emit(); })
        .catch(err => {
          this.last = { ...this.last, error: err instanceof Error ? err.message : 'Step failed' };
          this.emit();
        });
      return;
    }
    this.last = res as EngineSnapshot;
    this.emit();
  }

  private tick = () => {
    if (!this.playing) return;
    this.step();
    this.timerId = this.scheduler.set(this.speed, this.tick);
  };

  play(speedMs: number) {
    if (this.playing) return;
    this.playing = true;
    this.speed = Math.max(0, speedMs | 0);
    this.timerId = this.scheduler.set(this.speed, this.tick);
  }

  pause() {
    this.playing = false;
    this.scheduler.clear(this.timerId);
    this.timerId = null;
  }

  destroy() {
    this.pause();
    this.engine = null;
    this.subs.clear();
    this.onUpdate = undefined;
    this.onError = undefined;
  }
}

export type { IScheduler } from './scheduler';
