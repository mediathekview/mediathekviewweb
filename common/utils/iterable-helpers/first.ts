import { Predicate } from './types';

export function first<T>(iterable: Iterable<T>): T
export function first<T>(iterable: Iterable<T>, predicate: Predicate<T>): T
export function first<T>(iterable: Iterable<T>, predicate?: Predicate<T>): T
export function first<T>(iterable: Iterable<T>, predicate: Predicate<T> = (() => true)): T {
  for (const item of iterable) {
    const matches = predicate(item);

    if (matches) {
      return item;
    }
  }

  throw new Error('iterable was empty');
}
