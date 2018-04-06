export { Context } from '../iterable-helpers/types';

export type AsyncIteratorFunction<TIn, TOut> = (item: TIn, index: number) => TOut | Promise<TOut>;
export type AsyncPredicate<T> = AsyncIteratorFunction<T, boolean>;
export type AsyncComparator<T> = (a: T, b: T) => number | Promise<number>;

export type ParallelizableIteratorFunction<TIn, TOut> = (item: TIn, index: number) => Promise<TOut>;
export type ParallelizablePredicate<T> = ParallelizableIteratorFunction<T, boolean>;

