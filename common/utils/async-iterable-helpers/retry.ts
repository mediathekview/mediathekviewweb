import { AnyIterable } from '../any-iterable-iterator';
import { isAsyncIterable } from './is-async-iterable';
import { AsyncRetryPredicate } from './types';

export function retryAsync<T>(iterable: AnyIterable<T>, throwOnRetryFalse: boolean, predicate: AsyncRetryPredicate<T>): AsyncIterableIterator<T> {
  if (isAsyncIterable(iterable)) {
    return asyncRetry(iterable, throwOnRetryFalse, predicate);
  } else {
    return syncRetry(iterable, throwOnRetryFalse, predicate);
  }
}

async function* syncRetry<T>(iterable: Iterable<T>, throwOnRetryFalse: boolean, predicate: AsyncRetryPredicate<T>): AsyncIterableIterator<T> {
  let index = -1;

  for (const item of iterable) {
    index++;

    let success = false;
    let retry = true;

    while (!success && retry) {
      try {
        yield item;
        success = true;
      }
      catch (error) {
        const returnValue = predicate(error as Error, item, index);

        retry = (returnValue instanceof Promise)
          ? await returnValue
          : returnValue;

        if (!retry && throwOnRetryFalse) {
          throw error;
        }
      }
    }
  }
}

async function* asyncRetry<T>(iterable: AsyncIterable<T>, throwOnRetryFalse: boolean, predicate: AsyncRetryPredicate<T>): AsyncIterableIterator<T> {
  let index = -1;

  for await (const item of iterable) {
    index++;

    let success = false;
    let retry = true;

    while (!success && retry) {
      try {
        yield item;
        success = true;
      }
      catch (error) {
        const returnValue = predicate(error as Error, item, index);

        retry = (returnValue instanceof Promise)
          ? await returnValue
          : returnValue;

        if (!retry && throwOnRetryFalse) {
          throw error;
        }
      }
    }
  }
}
