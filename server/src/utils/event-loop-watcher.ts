import { Observable, Subject } from 'rxjs';
import { HighPrecisionTimer } from './high-precision-timer';
import { sleep } from '../common/utils';
import '../common/extensions/math';

type AggregationMode = 'min' | 'max' | 'avg';

export class EventLoopWatcher {
  private readonly subject: Subject<number>;
  private started = false;

  interval: number;

  constructor();
  constructor(interval: number);
  constructor(interval: number = 1000) {
    this.interval = interval;
    this.subject = new Subject();
  }

  watch(threshold: number): Observable<number>
  watch(threshold: number, samples: number, aggregation: AggregationMode): Observable<number>
  watch(threshold: number, samples: number = 1, aggregation: AggregationMode = 'max'): Observable<number> {
    if (!this.started) {
      this.startTimer();
      this.started = true;
    }

    return this.subject
      .bufferCount(samples)
      .map((measures) => this.aggregate(aggregation, measures))
      .filter((ms) => ms >= threshold);
  }

  async measureDelay(): Promise<number> {
    return new Promise<number>((resolve) => {
      const stopwatch = new HighPrecisionTimer();
      stopwatch.start();

      setImmediate(setImmediate, () => { // inner setImmediate, to measure an full event-loop-cycle
        const milliseconds = stopwatch.milliseconds;
        resolve(milliseconds);
      });
    });
  }

  private async startTimer() {
    const timer = setInterval(() => this.measureTick(), this.interval);
    timer.unref();
  }

  private async measureTick() {
    const delay = await this.measureDelay();
    this.subject.next(delay);
  }

  private aggregate(aggregation: AggregationMode, values: number[]): number {
    switch (aggregation) {
      case 'min':
        return Math.min(...values);

      case 'max':
        return Math.max(...values);

      case 'avg':
        return Math.average(...values);

      default:
        throw new Error(`aggregation ${aggregation} not implemented`);
    }
  }
}
