export type Context<T> = { readonly index: number, item: T };
export type Predicate<T> = (item: T) => boolean;
export type IteratorFunction<TIn, TOut> = (item: TIn, index: number) => TOut;
export type Comparator<T> = (a: T, b: T) => number;