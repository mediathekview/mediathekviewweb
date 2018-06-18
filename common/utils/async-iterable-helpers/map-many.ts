import { AnyIterable } from '../any-iterable';
import { isAsyncIterable } from './is-async-iterable';
import { AsyncIteratorFunction } from './types';

export function mapManyAsync<TIn, TOut>(iterable: AnyIterable<TIn>, mapper: AsyncIteratorFunction<TIn, AnyIterable<TOut>>): AsyncIterableIterator<TOut> {
  if (isAsyncIterable(iterable)) {
    return async(iterable as AsyncIterable<TIn>, mapper);
  } else {
    return sync(iterable as Iterable<TIn>, mapper);
  }
}

async function* sync<TIn, TOut>(iterable: Iterable<TIn>, mapper: AsyncIteratorFunction<TIn, AnyIterable<TOut>>): AsyncIterableIterator<TOut> {
  let index = 0;

  for (const item of iterable) {
    let mapped = mapper(item, index++);

    if (mapped instanceof Promise) {
      mapped = await mapped;
    }

    yield* mapped;
  }
}

async function* async<TIn, TOut>(iterable: AsyncIterable<TIn>, mapper: AsyncIteratorFunction<TIn, AnyIterable<TOut>>): AsyncIterableIterator<TOut> {
  let index = 0;

  for await (const item of iterable) {
    let mapped = mapper(item, index++);

    if (mapped instanceof Promise) {
      mapped = await mapped;
    }

    yield* mapped;
  }
}
