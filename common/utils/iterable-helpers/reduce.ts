import { Reducer } from './types';

export function reduce<T, U>(iterable: Iterable<T>, reducer: Reducer<T, U>, initialValue?: U): U {
  let accumulator: T | U | undefined = initialValue;
  let index = 0;

  for (const currentValue of iterable) {
    if (accumulator == undefined) {
      accumulator = currentValue;
    }
    else {
      accumulator = reducer(accumulator as U, currentValue, index++);
    }
  }

  return accumulator as U;
}
