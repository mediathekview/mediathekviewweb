import '../common/extensions/math';

import { Observable } from 'rxjs/Observable';
import { bufferCount, filter, map } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

import { timeout, Timer, immediate } from '../common/utils';

export enum AggregationMode {
  Minimum,
  Maximum,
  Average
}

export class EventLoopWatcher {
  private readonly subject: Subject<number>;
  private run: boolean;
  private running: boolean;

  measureInterval: number;

  constructor();
  constructor(measureInterval: number);
  constructor(measureInterval: number = 1000) {
    this.measureInterval = measureInterval;

    this.run = false;
    this.subject = new Subject();
  }

  start() {
    if (!this.run) {
      this.run = true;

      if (!this.running) {
        this.running = true;
        this.runMeasureLoop()
          .then(() => this.running = false);
      }
    }
  }

  stop() {
    this.run = false;
  }

  watch(): Observable<number>
  watch(threshold: number): Observable<number>
  watch(threshold: number, samples: number): Observable<number>
  watch(threshold: number, samples: number, aggregation: AggregationMode): Observable<number>
  watch(threshold: number = 0, samples: number = 1, aggregation: AggregationMode = AggregationMode.Maximum): Observable<number> {
    const observable = this.subject.pipe(
      bufferCount(samples),
      map((measures) => this.aggregate(aggregation, measures)),
      filter((ms) => ms >= threshold)
    );

    return observable;
  }

  async measureDelay(): Promise<number> {
    return new Promise<number>((resolve) => {
      const stopwatch = new Timer();

      setImmediate(() => {
        stopwatch.start();

        // inner setImmediate, to measure an full event-loop-cycle
        setImmediate(() => resolve(stopwatch.milliseconds));
      });
    });
  }

  private async runMeasureLoop() {
    while (this.run) {
      const delay = await this.measureDelay();
      this.subject.next(delay);

      await timeout(this.measureInterval);
    }
  }

  private aggregate(aggregation: AggregationMode, values: number[]): number {
    switch (aggregation) {
      case AggregationMode.Minimum:
        return Math.min(...values);

      case AggregationMode.Maximum:
        return Math.max(...values);

      case AggregationMode.Average:
        return Math.average(...values);

      default:
        throw new Error(`aggregation mode ${AggregationMode[aggregation]} not implemented`);
    }
  }
}
