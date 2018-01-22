import { Predicate } from './types';

export function* filter<T>(iterable: Iterable<T>, predicate: Predicate<T>): IterableIterator<T> {
  for (const item of iterable) {
    const matches = predicate(item);

    if (matches) {
      yield item;
    }
  }
}
