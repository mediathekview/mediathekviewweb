import { compareByValue } from './helpers';
import { Timer } from './timer';

type Sample = [number, Timer];

export class MovingMetric {
  private readonly interval: number;
  private readonly samples: Sample[];

  constructor(interval: number) {
    this.interval = interval;
    this.samples = [];
  }

  add(value: number): void {
    const timer = new Timer(true);
    const sample = [value, timer] as Sample;

    this.samples.push(sample);
  }

  sum(): number {
    this.removeOld();
    return this.samples.reduce((sum, [value]) => sum + value, 0);
  }

  average(): number {
    return this.sum() / this.samples.length;
  }

  median(): number {
    this.removeOld();

    const sortedSamples = this.sortedByValue();
    const index = sortedSamples.length / 2;

    if (index % 1 == 0) {
      const [value] = sortedSamples[index];
      return value;
    }
    else {
      const [lower] = sortedSamples[index - 1];
      const [upper] = sortedSamples[index + 1];

      return (lower + upper) / 2;
    }
  }

  minimum(): number {
    if (this.samples.length == 0) {
      return NaN;
    }

    this.removeOld();
    return this.samples.reduce((minimum, [value]) => Math.min(minimum, value), Number.MAX_VALUE);
  }

  maximum(): number {
    if (this.samples.length == 0) {
      return NaN;
    }

    this.removeOld();
    return this.samples.reduce((maximum, [value]) => Math.max(maximum, value), Number.MIN_VALUE);
  }

  count(): number {
    this.removeOld();
    return this.samples.length;
  }

  quantile(scalar: number): number {
    this.removeOld();

    const sortedSamples = this.sortedByValue();
    const index = Math.round((sortedSamples.length - 1) * scalar);

    if (Number.isInteger(index)) {
      const [value] = sortedSamples[index];
      return value;
    }
    else {
      const flooredIndex = Math.floor(index);
      const [lower] = sortedSamples[flooredIndex];
      const [upper] = sortedSamples[flooredIndex + 1];
      const difference = upper - lower;
      const ratio = index % 1;

      return lower + (ratio * difference);
    }
  }

  rate(): number {
    const sum = this.sum();
    const interval = this.actualInterval();
    const rate = sum / interval;

    return rate;
  }

  actualInterval(): number {
    this.removeOld();

    const oldestSample = this.samples[0];
    const [, timer] = oldestSample;

    return timer.seconds;
  }

  private sortedByValue(): Sample[] {
    return [...this.samples].sort(([a], [b]) => a - b);
  }

  private removeOld(): void {
    const firstIndexToKeep = this.samples.findIndex(([, timer]) => timer.milliseconds <= this.interval);

    if (firstIndexToKeep > 0) {
      this.samples.splice(0, firstIndexToKeep);
    }
  }
}
