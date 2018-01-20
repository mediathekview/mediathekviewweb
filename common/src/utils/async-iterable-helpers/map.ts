import { AnyIterable } from '../';
import { AsyncIteratorFunction } from './types';

export async function* mapAsync<TIn, TOut>(iterable: AnyIterable<TIn>, mapper: AsyncIteratorFunction<TIn, TOut>): AsyncIterableIterator<TOut> {
  let index = 0;

  for await (const item of iterable) {
    yield await mapper(item, index++);
  }
}