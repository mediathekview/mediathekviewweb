import { AnyIterable } from '../any-iterable';
import { isAsyncIterable } from './is-async-iterable';
import { AsyncIteratorFunction } from './types';

export function mapAsync<TIn, TOut>(iterable: AnyIterable<TIn>, mapper: AsyncIteratorFunction<TIn, TOut>): AsyncIterableIterator<TOut> {
  const isAsync = isAsyncIterable(iterable);

  if (isAsync) {
    return async(iterable as AsyncIterable<TIn>, mapper);
  } else {
    return sync(iterable as Iterable<TIn>, mapper);
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