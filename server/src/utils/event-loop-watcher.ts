import '../common/extensions/math';

import { Observable, Subject } from 'rxjs';
import { bufferCount, filter, map } from 'rxjs/operators';
import { Timer, timeout } from '../common/utils';

export enum AggregationMode {
  Minimum,
  Maximum,
  Mean,
  Median,
  FirstQuartile,
  ThirdQuartile
}

export class EventLoopWatcher {
  private readonly subject: Subject<number>;
  private run: boolean;
  private running: boolean;

  measureInterval: number;

  constructor();
  constructor(measureInterval: number);
  constructor(measureInterval: number = 100) {
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

      case AggregationMode.Mean:
        return Math.average(...values);

      case AggregationMode.Median:
        values = values.sort();
        const median = Math.round(values.length / 2);
        return values[median];

      case AggregationMode.FirstQuartile:
        values = values.sort();
        const firstQuartile = Math.round(values.length / 4 * 1);
        return values[firstQuartile];

      case AggregationMode.ThirdQuartile:
        values = values.sort();
        const thirdQuartile = Math.round(values.length / 4 * 3);
        return values[thirdQuartile];

      default:
        throw new Error(`aggregation mode ${aggregation} (${AggregationMode[aggregation]}) not implemented`);
    }
  }
}
