import { AnyIterable } from '../any-iterable-iterator';

export function isAsyncIterable<T>(anyIterable: AnyIterable<T>): anyIterable is AsyncIterable<T>;
export function isAsyncIterable<T = any>(obj: any): obj is AsyncIterable<T> {
  if (obj == null || obj == undefined) {
    return false;
  }

  return typeof obj[Symbol.asyncIterator] === 'function';
}

export function isAsyncIterableIterator<T>(anyIterable: AnyIterable<T>): anyIterable is AsyncIterableIterator<T>;
export function isAsyncIterableIterator<T = any>(obj: any): obj is AsyncIterableIterator<T> {
  const isIterable = isAsyncIterable(obj);
  const isIterator = typeof (obj as Partial<AsyncIterableIterator<any>>).next == 'function';

  return isIterable && isIterator;
}
