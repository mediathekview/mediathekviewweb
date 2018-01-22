import { AnyIterable, ResetPromise, isIterable, isAsyncIterable } from '../';

export function toAsyncIterator<T>(iterable: AnyIterable<T>): AsyncIterator<T> {
  let asyncIterator: AsyncIterator<T>;

  if (isIterable(iterable)) {
    const iterator = (iterable as Iterable<T>)[Symbol.iterator]();
    asyncIterator = iteratorToAsyncIterator(iterator);
  }
  else if (isAsyncIterable(iterable)) {
    asyncIterator = (iterable as AsyncIterable<T>)[Symbol.asyncIterator]();
  } else {
    throw new Error('parameter is neither iterable nor async-iterable');
  }

  return asyncIterator;
}

function iteratorToAsyncIterator<T>(iterator: Iterator<T>): AsyncIterator<T> {
  const asyncIterator: AsyncIterator<T> = {
    next: async (value?: any) => iterator.next(value)
  };

  if (iterator.return != undefined) {
    asyncIterator.return = (value?: any) => Promise.resolve((iterator.return as (value?: any) => IteratorResult<T>)(value));
  }

  if (iterator.throw != undefined) {
    asyncIterator.throw = (e?: any) => Promise.resolve((iterator.throw as (e?: any) => IteratorResult<T>)(e));
  }

  return asyncIterator;
}
