import { AnyIterable } from '../any-iterable-iterator';
import { timeout } from '../timing';
import { ThrottleFunction } from './types';

export function throttle<T>(iterable: AnyIterable<T>, delay: number): AsyncIterableIterator<T>;
export function throttle<T>(iterable: AnyIterable<T>, throttleFunction: ThrottleFunction): AsyncIterableIterator<T>;
export function throttle<T>(iterable: AnyIterable<T>, delayOrThrottleFunction: number | ThrottleFunction): AsyncIterableIterator<T>;
export async function* throttle<T>(iterable: AnyIterable<T>, delayOrThrottleFunction: number | ThrottleFunction): AsyncIterableIterator<T> {
  let throttleFunction: ThrottleFunction;

  if (typeof delayOrThrottleFunction == 'number') {
    throttleFunction = () => timeout(delayOrThrottleFunction);
  } else {
    throttleFunction = delayOrThrottleFunction;
  }

  for await (const item of iterable) {
    yield item;
    await throttleFunction();
  }
}
