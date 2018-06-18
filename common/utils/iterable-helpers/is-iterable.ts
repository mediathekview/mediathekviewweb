import { AnyIterable } from '../any-iterable';

export function isIterable<T>(anyIterable: AnyIterable<T>): anyIterable is Iterable<T>;
export function isIterable<T = any>(obj: any): obj is Iterable<T> {
  if (obj == null || obj == undefined) {
    return false;
  }

  return typeof obj[Symbol.iterator] === 'function';
}

export function isIterableIterator<T>(anyIterable: AnyIterable<T>): anyIterable is IterableIterator<T>;
export function isIterableIterator<T = any>(obj: any): obj is IterableIterator<T> {
  const typeIsIterable = isIterable(obj);
  const isIterator = typeof (obj as Partial<IterableIterator<any>>).next == 'function';

  return typeIsIterable && isIterator;
}