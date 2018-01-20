import { HighPrecisionTimer } from './high-precision-timer';
import { AnyIterable, interrupt } from '../common/utils'

export async function* interruptPerSecond<T>(iterable: AnyIterable<T>, value: number): AsyncIterableIterator<T> {
  const delay = Math.round(1e9 / value);
  const stopwatch = new HighPrecisionTimer(true);

  for await (const item of iterable) {
    const elapsed = stopwatch.nanoseconds;

    if (elapsed >= delay) {
      stopwatch.reset();
      await interrupt();
    }

    yield item;
  }
}