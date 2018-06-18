import { AnyIterable } from '../any-iterable';
import { isIterable } from '../iterable-helpers';

export async function toArrayAsync<T>(iterable: AnyIterable<T>): Promise<T[]> {
  if (isIterable(iterable)) {
    return Array.from(iterable);
  }

  const array: T[] = [];

  for await (const item of iterable) {
    array.push(item);
  }

  return array;
}
