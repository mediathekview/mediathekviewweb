import { IteratorFunction } from './types';

export function* intercept<T>(iterable: Iterable<T>, interceptor: IteratorFunction<T, void>): IterableIterator<T> {
  let index = 0;

  for (const item of iterable) {
    interceptor(item, index++);
    yield item;
  }
}