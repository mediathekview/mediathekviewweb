import { AnyIterable } from '../';
import { AsyncPredicate } from './types';

export async function anyAsync<T>(iterable: AnyIterable<T>, predicate: AsyncPredicate<T>): Promise<boolean> {
  let index = 0;

  for await (const item of iterable) {
    const matches = await predicate(item, index++);

    if (matches) {
      return true;
    }
  }

  return false;
}
