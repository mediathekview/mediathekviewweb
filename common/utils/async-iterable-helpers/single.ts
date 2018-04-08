import { AnyIterable } from '../any-iterable';
import { AsyncPredicate } from './types';

export async function singleAsync<T>(iterable: AnyIterable<T>): Promise<T>
export async function singleAsync<T>(iterable: AnyIterable<T>, predicate: AsyncPredicate<T>): Promise<T>
export async function singleAsync<T>(iterable: AnyIterable<T>, predicate?: AsyncPredicate<T>): Promise<T>
export async function singleAsync<T>(iterable: AnyIterable<T>, predicate: AsyncPredicate<T> = (() => true)): Promise<T> {
  let matched = false;
  let result: T | undefined;

  let index = 0;
  for await (const item of iterable) {
    let matches = predicate(item, index++);

    if (matches instanceof Promise) {
      matches = await matches;
    }

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
