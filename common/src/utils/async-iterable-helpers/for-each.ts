import { AnyIterable } from '../';
import { AsyncIteratorFunction } from './types';

export async function forEachAsync<T>(iterable: AnyIterable<T>, func: AsyncIteratorFunction<T, void>): Promise<void> {
  let index = 0;

  for await (const item of iterable) {
    await func(item, index++);
  }
}