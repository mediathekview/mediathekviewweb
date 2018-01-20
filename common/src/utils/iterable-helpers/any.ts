import { Predicate } from './types';

export function any<T>(iterable: Iterable<T>, predicate: Predicate<T>): boolean {
  for (const item of iterable) {
    const matches = predicate(item);

    if (matches) {
      return true;
    }
  }

  return false;
}