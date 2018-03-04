import { AnyIterable, isIterable } from '../';

export async function toArrayAsync<T>(iterable: AnyIterable<T>): Promise<T[]> {
  if (isIterable(iterable)) {
    return Array.from(iterable as Iterable<T>);
  }

  const array: T[] = [];

  for await (const item of iterable) {
    array.push(item);
  }

  return array;
}
