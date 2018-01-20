import { AnyIterable } from '../';
import { AsyncPredicate } from './types';

export async function singleAsync<T>(iterable: AnyIterable<T>, predicate: AsyncPredicate<T>): Promise<T> {
  let matched = false;
  let result: T | undefined;

  let index = 0;
  for await (const item of iterable) {
    const matches = await predicate(item, index++);

    if (matches) {
      if (matched) {
        throw new Error('more than one item matched predicate');
      }

      matched = true;
      result = item;
    }
  }

  if (!matched) {
    throw new Error('no item matched predicate');
  }

  return result as T;
}