const NS_PER_SEC = 1e9;
const NS_PER_MS = 1e6;
const NS_PER_US = 1e3;

export class HighPrecisionTimer {
  private begin: [number, number];

  constructor();
  constructor(start: boolean);
  constructor(start: boolean = false) {
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

  private read(): number;
  private read(divider: number): number;
  private read(divider?: number): number {
    const [secondsDiff, nanosecondsDiff] = process.hrtime(this.begin);
    let result = (secondsDiff * NS_PER_SEC) + nanosecondsDiff;

    if (divider != undefined) {
      result /= divider;
    }

    return result;
  }
}