import { Context } from '../iterable-helpers';

export type AsyncPredicate<T> = (item: T, index: number) => boolean | Promise<boolean>;
export type AsyncIteratorFunction<TIn, TOut> = (item: TIn, index: number) => TOut | Promise<TOut>;
//export type AsyncContextIteratorFunction<T> = (context: Context<T>) => void | Promise<void>;

export type ParallelizableAsyncPredicate<T> = (item: T, index: number) => Promise<boolean>;
export type ParallelizableIteratorFunction<TIn, TOut> = (item: TIn, index: number) => Promise<TOut>;
//export type ParallelizableContextIteratorFunction<T> = (context: Context<T>) => Promise<void>;

export { Context } from '../iterable-helpers';