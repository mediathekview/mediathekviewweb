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

    if (this.samples.length == 0) {
      return NaN;
    }

    return this.samples.reduce((sum, [value]) => sum + value, 0);
  }

  average(): number {
    this.removeOld();

    if (this.samples.length == 0) {
      return NaN;
    }

    return this.sum() / this.samples.length;
  }

  median(): number {
    this.removeOld();

    if (this.samples.length == 0) {
      return NaN;
    }

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
    this.removeOld();

    if (this.samples.length == 0) {
      return NaN;
    }

    return this.samples.reduce((minimum, [value]) => Math.min(minimum, value), Number.MAX_VALUE);
  }

  maximum(): number {
    this.removeOld();

    if (this.samples.length == 0) {
      return NaN;
    }

    return this.samples.reduce((maximum, [value]) => Math.max(maximum, value), Number.MIN_VALUE);
  }

  count(): number {
    this.removeOld();
    return this.samples.length;
  }

  quantile(scalar: number): number {
    this.removeOld();

    if (this.samples.length == 0) {
      return NaN;
    }

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
    this.removeOld();

    if (this.samples.length == 0) {
      return NaN;
    }

    const sum = this.sum();
    const interval = this.actualInterval();
    const seconds = interval / 1000;
    const rate = sum / seconds;

    return rate;
  }

  actualInterval(): number {
    this.removeOld();

    if (this.samples.length == 0) {
      return NaN;
    }

    const [, oldestTimer] = this.samples[0];
    return oldestTimer.milliseconds;
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
