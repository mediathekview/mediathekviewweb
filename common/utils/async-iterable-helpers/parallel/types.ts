export type FeedFunction<T> = (item: T, index: number) => void;
export type ParallelFeedIteratorFunction<TIn, TOut> = (item: TIn, index: number, feed: FeedFunction<TOut>) => Promise<void>;
