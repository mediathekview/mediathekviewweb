const NS_PER_SEC = 1e9;
const NS_PER_MS = 1e6;
const NS_PER_US = 1e3;

export class HighPrecisionTimer {
  private begin: [number, number] | null;

  constructor();
  constructor(start: boolean);
  constructor(start: boolean = false) {
    this.begin = null;

    if (start) {
      this.start();
    }
  }

  start() {
    this.reset();
  }

  reset() {
    this.begin = process.hrtime();
  }

  get nanoseconds(): number {
    return this.read();
  }

  get microseconds(): number {
    return this.read(NS_PER_US);
  }

  get milliseconds(): number {
    return this.read(NS_PER_MS);
  }

  get seconds(): number {
    return this.read(NS_PER_SEC);
  }

  measure(func: () => void): number;
  measure(func: () => Promise<void>): Promise<number>;
  measure(func: () => void | Promise<void>): number | Promise<number> {
    this.reset();

    const voidOrPromise = func();

    if (voidOrPromise instanceof Promise) {
      return voidOrPromise.then(() => this.milliseconds);
    } else {
      return this.milliseconds;
    }
  }

  static measure(func: () => void): number;
  static measure(func: () => Promise<void>): Promise<number>;
  static measure(func: () => void | Promise<void>): number | Promise<number> {
    return new HighPrecisionTimer().measure(func);
  }

  private read(): number;
  private read(divider: number): number;
  private read(divider?: number): number {
    if (this.begin == null) {
      throw new Error('timer not started');
    }

    const [secondsDiff, nanosecondsDiff] = process.hrtime(this.begin);
    let result = (secondsDiff * NS_PER_SEC) + nanosecondsDiff;

    if (divider != undefined) {
      result /= divider;
    }

    return result;
  }
}
