import type { IScheduler } from './scheduler';
import { VisualizationEngine, type EngineSnapshot } from './engine';

type UpdateFn = (snapshot: EngineSnapshot) => void;

export class VisualizationController {
  private engine: VisualizationEngine | null = null;
  private scheduler: IScheduler;
  private timerId: number | null = null;
  private playing = false;
  private speed = 250;

  onUpdate?: UpdateFn;
  onError?: (message: string) => void;

  constructor(scheduler: IScheduler) {
    this.scheduler = scheduler;
  }

  get isPlaying(): boolean {
    return this.playing;
  }
  // replace the entire class body or just these methods if you prefer

  async init(opts: { engine?: any; baseInput?: Record<string, any> }) {
    this.engine = opts.engine;
    if (!this.engine) {
      this.onError?.('Engine not initialized');
      return;
    }
    if (opts.baseInput) this.engine.setInput(opts.baseInput);
    const snap = this.engine.snapshot();
    this.onUpdate?.(snap);
    if (snap.error) this.onError?.(snap.error);
  }

  step() {
    if (!this.engine) {
      this.onError?.('Engine not initialized');
      return;
    }
    const snap = this.engine.step();
    this.onUpdate?.(snap);
    if (snap.error) this.onError?.(snap.error);
  }

  private loop = (): void => {
    if (!this.playing) return;
    this.step();
    if (this.playing) {
      this.timerId = this.scheduler.set(this.speed, this.loop);
    }
  };

  play(speedMs: number): void {
    if (this.playing) return;
    this.playing = true;
    this.speed = speedMs;
    this.timerId = this.scheduler.set(this.speed, this.loop);
  }

  pause(): void {
    this.playing = false;
    if (this.timerId != null) {
      this.scheduler.clear(this.timerId);
      this.timerId = null;
    }
  }

  destroy(): void {
    this.pause();
    this.engine = null;
    this.onUpdate = undefined;
    this.onError = undefined;
  }
}
