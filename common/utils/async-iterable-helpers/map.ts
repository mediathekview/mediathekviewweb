import { AnyIterable } from '../any-iterable-iterator';
import { isAsyncIterable } from './is-async-iterable';
import { AsyncIteratorFunction } from './types';

export function mapAsync<TIn, TOut>(iterable: AnyIterable<TIn>, mapper: AsyncIteratorFunction<TIn, TOut>): AsyncIterableIterator<TOut> {
  if (isAsyncIterable(iterable)) {
    return async(iterable, mapper);
  } else {
    return sync(iterable, mapper);
  }
}

async function* sync<TIn, TOut>(iterable: Iterable<TIn>, mapper: AsyncIteratorFunction<TIn, TOut>): AsyncIterableIterator<TOut> {
  let index = 0;

  for (const item of iterable) {
    let returnValue = mapper(item, index++);

    if (returnValue instanceof Promise) {
      returnValue = await returnValue;
    }

    yield returnValue;
  }
}

async function* async<TIn, TOut>(iterable: AsyncIterable<TIn>, mapper: AsyncIteratorFunction<TIn, TOut>): AsyncIterableIterator<TOut> {
  let index = 0;

  for await (const item of iterable) {
    let returnValue = mapper(item, index++);

    if (returnValue instanceof Promise) {
      returnValue = await returnValue;
    }

    yield returnValue;
  }
}
