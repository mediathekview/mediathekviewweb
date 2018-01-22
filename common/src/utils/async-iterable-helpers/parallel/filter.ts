import { AnyIterable, ParallelizableAsyncPredicate } from '../../';
import { parallelFeed } from './feed';

export function parallelFilter<T>(iterable: AnyIterable<T>, concurrency: number, keepOrder: boolean, predicate: ParallelizableAsyncPredicate<T>): AsyncIterable<T> {
  return parallelFeed(iterable, concurrency, keepOrder, async (item, index, feed) => {
    const matches = await predicate(item, index);

    if (matches) {
      feed(item, index);
    }
  });
}
