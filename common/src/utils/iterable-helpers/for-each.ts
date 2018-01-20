import { IteratorFunction } from './types';

export function forEach<T>(iterable: Iterable<T>, func: IteratorFunction<T, void>): void {
  let index = 0;

  for (const item of iterable) {
    func(item, index++);
  }
}