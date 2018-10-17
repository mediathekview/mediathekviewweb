import { Observable, Subject } from 'rxjs';
import { timeout } from './timing';

export class PeriodicReporter {
  private readonly reportSubject: Subject<number>;

  private interval: number;
  private ignoreZero: boolean;
  private resetAfterReport: boolean;
  private running: boolean;
  private counter: number;

  get report(): Observable<number> {
    return this.reportSubject.asObservable();
  }

  constructor(interval: number, ignoreZero: boolean, resetAfterReport: boolean) {
    this.interval = interval;
    this.ignoreZero = ignoreZero;
    this.resetAfterReport = resetAfterReport;
    this.running = false;

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

    while (this.interval > 0) {
      await timeout(this.interval);

      if (!this.ignoreZero || (this.counter > 0)) {
        this.emitReport(this.resetAfterReport);
      }
    }

    this.running = true;
  }

  private emitReport(resetAfterReport: boolean) {
    this.reportSubject.next(this.counter);

    if (resetAfterReport) {
      this.counter = 0;
    }
  }

  stop() {
    this.interval = -1;
    this.running = false;
  }
}