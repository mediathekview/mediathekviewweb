import { AnyIterable } from '../any-iterable-iterator';
import { isIterable } from '../iterable-helpers';

export async function toArrayAsync<T>(iterable: AnyIterable<T>): Promise<T[]> {
  if (isIterable(iterable)) {
    return [...iterable];
  }

  const array: T[] = [];

  for await (const item of iterable) {
    array.push(item);
  }

  return array;
}
