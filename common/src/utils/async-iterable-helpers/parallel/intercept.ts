import { AnyIterable, ParallelizableIteratorFunction } from '../../';
import { parallelFeed } from './feed';

export function parallelIntercept<T>(iterable: AnyIterable<T>, concurrency: number, keepOrder: boolean, interceptor: ParallelizableIteratorFunction<T, void>): AsyncIterable<T> {
  return parallelFeed(iterable, concurrency, keepOrder, async (item, index, feed) => {
    await interceptor(item, index);
    feed(item, index);
  });
}