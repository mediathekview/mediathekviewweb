import { AnyIterable } from '../any-iterable-iterator';
import { toArrayAsync } from './to-array';
import { AsyncComparator } from './types';

export function sortAsync<T>(iterable: AnyIterable<T>, comparator?: AsyncComparator<T>): AsyncIterable<T> {
  const sortedAsyncIterable =
    (comparator == undefined)
      ? sortWithoutComparator(iterable)
      : sortWithComparator(iterable, comparator);

  return sortedAsyncIterable;
}

async function* sortWithoutComparator<T>(iterable: AnyIterable<T>): AsyncIterable<T> {
  const array = await toArrayAsync(iterable);
  const sorted = array.sort();

  yield* sorted;
}

async function* sortWithComparator<T>(_iterable: AnyIterable<T>, _comparator: AsyncComparator<T>): AsyncIterable<T> {
  throw new Error('not implemented');
}
