import { Predicate } from './types';

export function first<T>(iterable: Iterable<T>): T
export function first<T>(iterable: Iterable<T>, predicate: Predicate<T>): T
export function first<T>(iterable: Iterable<T>, predicate?: Predicate<T>): T
export function first<T>(iterable: Iterable<T>, predicate: Predicate<T> = (() => true)): T {
  let index = 0;

  for (const item of iterable) {
    const matches = predicate(item, index++);

    if (matches) {
      return item;
    }
  }

  throw new Error('iterable was empty');
}
