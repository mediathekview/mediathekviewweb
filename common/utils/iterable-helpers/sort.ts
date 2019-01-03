import { Comparator } from './types';

export function sort<T>(iterable: Iterable<T>): Iterable<T>;
export function sort<T>(iterable: Iterable<T>, comparator: Comparator<T>): Iterable<T>;
export function sort<T>(iterable: Iterable<T>, comparator?: Comparator<T>): Iterable<T>;
export function sort<T>(iterable: Iterable<T>, comparator?: Comparator<T>): Iterable<T> {
  const array = [...iterable];
  const sorted = array.sort(comparator);

  return sorted;
}
