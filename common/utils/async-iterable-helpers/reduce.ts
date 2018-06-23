import { AnyIterable } from '../any-iterable';
import { isAsyncIterable } from './is-async-iterable';
import { AsyncReducer } from './types';

export function reduce<T>(iterable: AnyIterable<T>, reducer: AsyncReducer<T, T>): Promise<T>;
export function reduce<T, U>(iterable: AnyIterable<T>, reducer: AsyncReducer<T, U>, initialValue: U): Promise<U>;
export function reduce<T, U>(iterable: AnyIterable<T>, reducer: AsyncReducer<T, U>, initialValue?: U): Promise<U>;
export function reduce<T, U>(iterable: AnyIterable<T>, reducer: AsyncReducer<T, U>, initialValue?: U): Promise<U> {
  if (isAsyncIterable(iterable)) {
    return reduceAsync(iterable, reducer, initialValue);
  } else {
    return reduceSync(iterable, reducer, initialValue);
  }
}

export async function reduceSync<T, U>(iterable: Iterable<T>, reducer: AsyncReducer<T, U>, initialValue?: U): Promise<U> {
  let accumulator: T | U | undefined = initialValue;

  let index = 0;
  for (const currentValue of iterable) {
    if (accumulator == undefined) {
      accumulator = currentValue;
    }
    else {
      const returnValue = reducer(accumulator as U, currentValue, index++);

      if (returnValue instanceof Promise) {
        accumulator = await returnValue;
      } else {
        accumulator = returnValue;
      }
    }
  }

  return accumulator as U;
}

async function reduceAsync<T, U>(iterable: AnyIterable<T>, reducer: AsyncReducer<T, U>, initialValue?: U): Promise<U> {
  let accumulator: T | U | undefined = initialValue;
  let index = 0;
  for await (const currentValue of iterable) {
    if (accumulator == undefined) {
      accumulator = currentValue;
    }
    else {
      const returnValue = reducer(accumulator as U, currentValue, index++);
      if (returnValue instanceof Promise) {
        accumulator = await returnValue;
      }
      else {
        accumulator = returnValue;
      }
    }
  }
  return accumulator as U;
}
