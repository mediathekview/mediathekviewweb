import { Timer } from '../timer';
import { AnyIterable } from '../any-iterable';
import { interrupt } from '../timing';

export async function* interruptEveryAsync<T>(iterable: AnyIterable<T>, every: number): AsyncIterableIterator<T> {
  let counter = 0;

  for await (const item of iterable) {
    if ((counter++ % every) == 0) {
      await interrupt();
    }

    yield item;
  }
}

export async function* interruptPerSecondAsync<T>(iterable: AnyIterable<T>, value: number): AsyncIterableIterator<T> {
  const delay = Math.round(1e9 / value);
  const stopwatch = new Timer(true);

  for await (const item of iterable) {
    const elapsed = stopwatch.nanoseconds;

    if (elapsed >= delay) {
      stopwatch.reset();
      await interrupt();
    }

    yield item;
  }
}
