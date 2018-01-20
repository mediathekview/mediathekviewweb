import { AnyIterable } from '../';
import { AsyncPredicate } from './types';

export async function* filterAsync<T>(iterable: AnyIterable<T>, predicate: AsyncPredicate<T>): AsyncIterableIterator<T> {
  let index = 0;

  for await (const item of iterable) {
    const matches = await predicate(item, index++);

    if (matches) {
      yield item;
    }
  }
}