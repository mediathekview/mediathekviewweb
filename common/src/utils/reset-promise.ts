export class ResetPromise<T> implements Promise<T> {
  private backingPromise: Promise<T>;
  private resolvePromise: (value?: T | PromiseLike<T>) => void;
  private rejectPromise: (reason?: any) => void;

  readonly [Symbol.toStringTag]: 'Promise' = 'Promise';

  constructor() {
    this.reset();
  }

  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null | undefined,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined): Promise<TResult1 | TResult2> {
    return this.backingPromise.then(onfulfilled, onrejected);
  }

  catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null | undefined): Promise<T | TResult> {
    return this.backingPromise.catch(onrejected);
  }

  resolve(value?: T | PromiseLike<T>): this {
    this.resolvePromise(value);
    return this;
  }

  reject(reason?: any): this {
    this.rejectPromise(reason);
    return this;
  }

  reset(): this {
    this.backingPromise = new Promise<T>((resolve, reject) => {
      this.resolvePromise = resolve;
      this.rejectPromise = reject;
    });

    return this;
  }
}
