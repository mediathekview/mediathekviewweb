import { Context } from '../iterable-helpers';

export type AsyncIteratorFunction<TIn, TOut> = (item: TIn, index: number) => TOut | Promise<TOut>;
export type AsyncPredicate<T> = AsyncIteratorFunction<T, boolean>;
//export type AsyncContextIteratorFunction<T> = (context: Context<T>) => void | Promise<void>;

export type ParallelizableIteratorFunction<TIn, TOut> = (item: TIn, index: number) => Promise<TOut>;
export type ParallelizablePredicate<T> = ParallelizableIteratorFunction<T, boolean>;
//export type ParallelizableContextIteratorFunction<T> = (context: Context<T>) => Promise<void>;

export { Context } from '../iterable-helpers';
