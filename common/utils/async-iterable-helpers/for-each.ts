import { AnyIterable } from '../any-iterable';
import { isAsyncIterable } from './is-async-iterable';
import { AsyncIteratorFunction } from './types';

export function forEachAsync<T>(iterable: AnyIterable<T>, func: AsyncIteratorFunction<T, void>): Promise<void> {
  if (isAsyncIterable(iterable)) {
    return async(iterable, func);
  } else {
    return sync(iterable, func);
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