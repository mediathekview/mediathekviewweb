export type Context<T> = { item: T, readonly index: number };
export type Predicate<T> = (item: T, index: number) => boolean;
export type IteratorFunction<TIn, TOut> = (item: TIn, index: number) => TOut;
export type Comparator<T> = (a: T, b: T) => number;
export type Reducer<T, U> = (previous: U, current: T, index: number) => U;