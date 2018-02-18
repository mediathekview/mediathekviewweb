import { AnyIterable, isAsyncIterable } from '../';
import { AsyncIteratorFunction } from './types';

export function forEachAsync<T>(iterable: AnyIterable<T>, func: AsyncIteratorFunction<T, void>): Promise<void> {
  const isAsync = isAsyncIterable(iterable);

  if (isAsync) {
    return async(iterable as AsyncIterable<T>, func);
  } else {
    return sync(iterable as Iterable<T>, func);
  }
}

async function sync<T>(iterable: Iterable<T>, func: AsyncIteratorFunction<T, void>): Promise<void> {
  let index = 0;

  for (const item of iterable) {
    const returnValue = func(item, index++);

    if (returnValue instanceof Promise) {
      await returnValue;
    }
  }
}

async function async<T>(iterable: AsyncIterable<T>, func: AsyncIteratorFunction<T, void>): Promise<void> {
  let index = 0;

  for await (const item of iterable) {
    const returnValue = func(item, index++);

    if (returnValue instanceof Promise) {
      await returnValue;
    }
  }
}