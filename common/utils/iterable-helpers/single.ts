import { Predicate } from './types';

export function single<T>(iterable: Iterable<T>): T;
export function single<T>(iterable: Iterable<T>, predicate: Predicate<T>): T;
export function single<T>(iterable: Iterable<T>, predicate?: Predicate<T>): T;
export function single<T>(iterable: Iterable<T>, predicate: Predicate<T> = (() => true)): T {
  let matched = false;
  let result: T | undefined;

  for (const item of iterable) {
    const matches = predicate(item);

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
