import { AnyIterable, AnyIterator } from '../any-iterable-iterator';
import { isIterable } from '../iterable-helpers/is-iterable';
import { isAsyncIterable } from './is-async-iterable';

export function iterableToAsyncIterator<T>(iterable: AnyIterable<T>): AsyncIterator<T> {
  let asyncIterator: AsyncIterator<T>;

  if (isIterable(iterable)) {
    const iterator = iterable[Symbol.iterator]();
    asyncIterator = iteratorToAsyncIterator(iterator);
  }
  else if (isAsyncIterable(iterable)) {
    asyncIterator = iterable[Symbol.asyncIterator]();
  }
  else {
    throw new Error('parameter is neither iterable nor async-iterable');
  }

  return asyncIterator;
}

export function iteratorToAsyncIterator<T>(iterator: AnyIterator<T>): AsyncIterator<T> {
  const asyncIterator: AsyncIterator<T> = {
    next: async (value?: any) => iterator.next(value)
  };

  if (iterator.return != undefined) {
    asyncIterator.return = (value?: any) => (value instanceof Promise) ? value : Promise.resolve(iterator.return!(value)); // tslint:disable-line: no-non-null-assertion
  }

  if (iterator.throw != undefined) {
    asyncIterator.throw = (e?: any) => (e instanceof Promise) ? e : Promise.resolve(iterator.throw!(e)); // tslint:disable-line: no-non-null-assertion
  }

  return asyncIterator;
}
