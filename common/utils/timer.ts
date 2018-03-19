const NS_PER_SEC = 1e9;
const NS_PER_MS = 1e6;
const NS_PER_US = 1e3;

declare const performance: any;
declare const process: any;

let getBegin: () => any;
let getDuration: (begin: any) => number;

if (typeof process == 'object' && typeof process.hrtime == 'function') {
  console.log('using hrtime');
  getBegin = () => process.hrtime();
  getDuration = (begin: any) => {
    const [secondsDiff, nanosecondsDiff] = process.hrtime(begin);
    const nanoseconds = (secondsDiff * NS_PER_SEC) + nanosecondsDiff;

    return nanoseconds;
  };
}
else if (typeof performance == 'object' && typeof performance.now == 'function') {
  console.log('using performance');
  getBegin = () => performance.now();
  getDuration = (begin: number) => (performance.now() - begin) * NS_PER_MS;
}
else {
  console.log('using date');
  getBegin = () => Date.now();
  getDuration = (begin: number) => (Date.now() - begin) * NS_PER_MS;
}

export class Timer {
  private begin: any | null;

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
    this.begin = getBegin();
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
    return new Timer().measure(func);
  }

  private read(): number;
  private read(divider: number): number;
  private read(divider?: number): number {
    if (this.begin == null) {
      throw new Error('timer not started');
    }

    let result = getDuration(this.begin);

    if (divider != undefined) {
      result /= divider;
    }

    return result;
  }
}
