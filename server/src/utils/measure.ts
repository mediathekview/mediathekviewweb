import { HighPrecisionTimer } from './high-precision-timer';

export function measureTime(func: () => void): number;
export function measureTime(func: () => Promise<void>): Promise<number>;
export function measureTime(func: () => void | Promise<void>): number | Promise<number> {
  const timer = new HighPrecisionTimer(true);

  const voidOrPromise = func();

  if (voidOrPromise instanceof Promise) {
    return voidOrPromise.then(() => timer.milliseconds);
  } else {
    return timer.milliseconds;
  }
}