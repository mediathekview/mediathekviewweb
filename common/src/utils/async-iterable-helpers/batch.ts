import { AnyIterable, isAsyncIterable } from '../';

export async function* batchAsync<T>(iterable: AnyIterable<T>, size: number): AsyncIterableIterator<T[]> {
  const isAsync = isAsyncIterable(iterable);

  if (isAsync) {
    return async(iterable as AsyncIterable<T>, size);
  } else {
    return sync(iterable as Iterable<T>, size);
  }
}

async function* sync<T>(iterable: Iterable<T>, size: number): AsyncIterableIterator<T[]> {
  let buffer: T[] = [];

  for (const item of iterable) {
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

async function* async<T>(iterable: AsyncIterable<T>, size: number): AsyncIterableIterator<T[]> {
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