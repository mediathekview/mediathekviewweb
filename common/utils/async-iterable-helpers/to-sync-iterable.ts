import { AnyIterable } from '../any-iterable';
import { isIterable } from '../iterable-helpers/is-iterable';

export async function toSync<T>(iterable: AnyIterable<T>): Promise<Iterable<T>> {
  const isSync = isIterable(iterable);

  if (isSync) {
    return iterable as Iterable<T>;
  } else {
    return toSyncAsync(iterable as AsyncIterable<T>);
  }
}

async function toSyncAsync<T>(iterable: AsyncIterable<T>): Promise<Iterable<T>> {
  const array: T[] = [];

  for await (const value of iterable) {
    array.push(value);
  }

  return array;
}