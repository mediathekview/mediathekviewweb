import { isIterable } from '../iterable-helpers/is-iterable';

export function isAsyncIterable(obj: any): boolean {
  if (obj == null || obj == undefined) {
    return false;
  }

  return typeof obj[Symbol.asyncIterator] === 'function';
}

export function isAnyIterable(obj: any): boolean {
  return isIterable(obj) || isAsyncIterable(obj);
}