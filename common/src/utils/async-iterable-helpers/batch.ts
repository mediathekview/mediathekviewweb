import { AnyIterable } from '../';

export async function* batchAsync<T>(iterable: AnyIterable<T>, size: number): AsyncIterableIterator<T[]> {
  let buffer: T[] = [];

  for await (const item of iterable) {
    buffer.push(item);

    if (buffer.length >= size) {
      yield buffer;
      buffer = [];
    }
  }

  if (buffer.length > 0) {
    yield buffer;
  }
}