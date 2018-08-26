import { Predicate } from './types';

export function any<T>(iterable: Iterable<T>): boolean;
export function any<T>(iterable: Iterable<T>, predicate: Predicate<T>): boolean;
export function any<T>(iterable: Iterable<T>, predicate?: Predicate<T>): boolean;
export function any<T>(iterable: Iterable<T>, predicate: Predicate<T> = (() => true)): boolean {
  let index = 0;

  for (const item of iterable) {
    const matches = predicate(item, index++);

    if (matches) {
      return true;
    }
  }

  return false;
}
