const NS_PER_SEC = 1e9;
const NS_PER_MS = 1e6;
const NS_PER_US = 1e3;

declare const performance: any;
declare const process: any;

let getBegin: () => any;
let getDuration: (begin: any) => number;

if (typeof process == 'object' && typeof process.hrtime == 'function') {
  getBegin = () => process.hrtime();
  getDuration = (begin: any) => {
    const [secondsDiff, nanosecondsDiff] = process.hrtime(begin);
    const nanoseconds = (secondsDiff * NS_PER_SEC) + nanosecondsDiff;

    return nanoseconds;
  };
}
else if (typeof performance == 'object' && typeof performance.now == 'function') {
  getBegin = () => performance.now();
  getDuration = (begin: number) => (performance.now() - begin) * NS_PER_MS;
}
else {
  getBegin = () => Date.now();
  getDuration = (begin: number) => (Date.now() - begin) * NS_PER_MS;
}

export class Timer {
  private elapsedNanoseconds: number;
  private begin?: any;

  static measure(func: () => void): number {
    const timer = new Timer();
    return timer.measure(func);
  }

  static async measureAsync(func: () => Promise<void>): Promise<number> {
    const timer = new Timer();
    return await timer.measureAsync(func);
  }

  constructor(start: boolean = false) {
    this.elapsedNanoseconds = 0;

    if (start) {
      this.start();
    }
  }

  start(): void {
    if (this.begin == undefined) {
      this.begin = getBegin();
    }
  }

  stop(): void {
    if (this.begin != undefined) {
      const nanoseconds = this.read();
      this.elapsedNanoseconds += nanoseconds;
      this.begin = undefined;
    }
  }

  restart(): void {
    this.reset();
    this.start();
  }

  reset(): void {
    this.begin = undefined;
    this.elapsedNanoseconds = 0;
  }

  get nanoseconds(): number {
    const result = this.elapsedNanoseconds + this.read();
    return result;
  }

  get microseconds(): number {
    return this.nanoseconds / NS_PER_US;
  }

  get milliseconds(): number {
    return this.nanoseconds / NS_PER_MS;
  }

  get seconds(): number {
    return this.nanoseconds / NS_PER_SEC;
  }

  measure(func: () => void): number {
    this.restart();
    func();

    return this.milliseconds;
  }

  async measureAsync(func: () => Promise<void>): Promise<number> {
    this.restart();
    await func();

    return this.milliseconds;
  }

  private read(): number {
    if (this.begin == undefined) {
      return 0;
    }

    const result = getDuration(this.begin);
    return result;
  }
}
