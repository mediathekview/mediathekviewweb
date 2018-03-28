export type Undefinable<T> = T | undefined;
export type Sub<O extends string, D extends string> = {[K in O]: (Record<D, never> & Record<string, K>)[K]}[O]
export type Omit<O, D extends string> = Pick<O, Sub<keyof O, D>>
export type PartialProperty<T, P extends keyof T> = Partial<Pick<T, P>>;