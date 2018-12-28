import { Observable, Subject } from 'rxjs';
import { DeferredPromise } from '../promise/deferred-promise';
import { cancelableTimeout } from './timing';

export class PeriodicReporter {
  private readonly reportSubject: Subject<number>;

  private interval: number;
  private ignoreZero: boolean;
  private resetAfterReport: boolean;
  private running: boolean;
  private counter: number;
  private stopRequested: boolean;
  private stopPromise: DeferredPromise;
  private stopped: DeferredPromise;

  get report(): Observable<number> {
    return this.reportSubject.asObservable();
  }

  constructor(interval: number, ignoreZero: boolean, resetAfterReport: boolean) {
    this.interval = interval;
    this.ignoreZero = ignoreZero;
    this.resetAfterReport = resetAfterReport;
    this.running = false;

    this.stopPromise = new DeferredPromise();
    this.stopped = new DeferredPromise();
    this.reportSubject = new Subject();
  }

  increase(count: number) {
    this.counter += count;
  }

  async run() {
    if (this.running) {
      throw new Error('already started');
    }

    this.counter = 0;
    this.running = true;
    this.stopRequested = false;
    this.stopPromise.reset();
    this.stopped.reset();

    while (!this.stopRequested) {
      await cancelableTimeout(this.stopPromise, this.interval);

      if (!this.stopRequested && (!this.ignoreZero || (this.counter > 0))) {
        this.emitReport(this.resetAfterReport);
      }
    }

    this.running = false;
    this.stopped.resolve();
  }

  async stop(): Promise<void> {
    if (!this.running) {
      return;
    }

    this.stopRequested = true;
    this.stopPromise.resolve();
    await this.stopped;
  }

  private emitReport(resetAfterReport: boolean) {
    this.reportSubject.next(this.counter);

    if (resetAfterReport) {
      this.counter = 0;
    }
  }
}
