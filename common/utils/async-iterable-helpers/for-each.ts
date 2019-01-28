import { AnyIterable } from '../any-iterable-iterator';
import { isAsyncIterable } from './is-async-iterable';
import { AsyncIteratorFunction } from './types';

// tslint:disable-next-line: promise-function-async
export function forEachAsync<T>(iterable: AnyIterable<T>, func: AsyncIteratorFunction<T, any>): Promise<void> {
  if (isAsyncIterable(iterable)) {
    return asyncForEachAsync(iterable, func);
  } else {
    return syncForEachAsync(iterable, func);
  }
}

async function syncForEachAsync<T>(iterable: Iterable<T>, func: AsyncIteratorFunction<T, any>): Promise<void> {
  let index = 0;

  for (const item of iterable) {
    const returnValue = func(item, index++);

    if (returnValue instanceof Promise) {
      await returnValue;
    }
  }
}

async function asyncForEachAsync<T>(iterable: AsyncIterable<T>, func: AsyncIteratorFunction<T, any>): Promise<void> {
  let index = 0;

  for await (const item of iterable) {
    const returnValue = func(item, index++);

    if (returnValue instanceof Promise) {
      await returnValue;
    }
  }
}
