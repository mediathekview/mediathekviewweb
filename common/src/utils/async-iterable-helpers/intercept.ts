import { AnyIterable } from '../';
import { AsyncIteratorFunction } from './types';

export async function* interceptAsync<T>(iterable: AnyIterable<T>, interceptor: AsyncIteratorFunction<T, void>): AsyncIterableIterator<T> {
  let index = 0;

  for await (const item of iterable) {
    await interceptor(item, index++);
    yield item;
  }
}
