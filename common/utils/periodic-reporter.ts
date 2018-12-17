import { Observable, Subject } from 'rxjs';
import { timeout } from './timing';
import { DeferredPromise } from './deferred-promise';

export class PeriodicReporter {
  private readonly reportSubject: Subject<number>;

  private interval: number;
  private ignoreZero: boolean;
  private resetAfterReport: boolean;
  private running: boolean;
  private counter: number;
  private stopRequested: boolean;
  private stopped: DeferredPromise;

  get report(): Observable<number> {
    return this.reportSubject.asObservable();
  }

  constructor(interval: number, ignoreZero: boolean, resetAfterReport: boolean) {
    this.interval = interval;
    this.ignoreZero = ignoreZero;
    this.resetAfterReport = resetAfterReport;
    this.running = false;

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
    this.stopped.reset();

    while (!this.stopRequested) {
      await timeout(this.interval);

      if (!this.ignoreZero || (this.counter > 0)) {
        this.emitReport(this.resetAfterReport);
      }
    }

    this.stopped.resolve();
  }

  async stop(): Promise<void> {
    this.stopRequested = true;
    await this.stopped;
  }

  private emitReport(resetAfterReport: boolean) {
    this.reportSubject.next(this.counter);

    if (resetAfterReport) {
      this.counter = 0;
    }
  }
}
