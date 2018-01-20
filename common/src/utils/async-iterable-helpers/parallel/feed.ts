import { AnyIterable, FeedableAsyncIterable, OrderedFeedableAsyncIterable } from '../../';
import { ParallelFeedIteratorFunction, FeedFunction } from './types';
import { parallelForEach } from './for-each';

export function parallelFeed<TIn, TOut>(iterable: AnyIterable<TIn>, concurrency: number, keepOrder: boolean, func: ParallelFeedIteratorFunction<TIn, TOut>): AsyncIterable<TOut> {
  let out: FeedableAsyncIterable<TOut> | OrderedFeedableAsyncIterable<TOut>;
  let feed: FeedFunction<TOut>;

  if (keepOrder) {
    out = new OrderedFeedableAsyncIterable();
  } else {
    out = new FeedableAsyncIterable();
  }

  if (out instanceof FeedableAsyncIterable) {
    feed = (item: TOut, index: number) => (out as FeedableAsyncIterable<TOut>).feed(item);
  } else {
    feed = (item: TOut, index: number) => (out as OrderedFeedableAsyncIterable<TOut>).feed(item, index);
  }

  parallelForEach(iterable, concurrency, async (item, index) => {
    await func(item, index, feed);
  }).then(() => out.end());

  return out;
}