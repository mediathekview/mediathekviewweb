import { Predicate } from './types';

export function* filter<T>(iterable: Iterable<T>, predicate: Predicate<T>): IterableIterator<T> {
  let index = 0;

  for (const item of iterable) {
    const matches = predicate(item, index++);

    if (matches) {
      yield item;
    }
  }
}
