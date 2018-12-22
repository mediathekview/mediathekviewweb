export class DeferredPromise<T = void> implements Promise<T> {
  private backingPromise: Promise<T>;
  private resolvePromise: (value?: T | PromiseLike<T>) => void;
  private rejectPromise: (reason?: any) => void;

  private _settled: boolean;

  readonly [Symbol.toStringTag] = 'Promise';

  get settled(): boolean {
    return this._settled;
  }

  get pending(): boolean {
    return !this._settled;
  }

  constructor() {
    this.reset();
  }

  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null | undefined, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined): Promise<TResult1 | TResult2> {
    return this.backingPromise.then(onfulfilled, onrejected);
  }

  catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null | undefined): Promise<T | TResult> {
    return this.backingPromise.catch(onrejected);
  }

  finally(onfinally?: (() => void) | null | undefined): Promise<T> {
    return this.backingPromise.finally(onfinally);
  }

  resolve(value?: T | PromiseLike<T>): this {
    if (this._settled) {
      throw new Error('already resolved or rejected');
    }

    this.resolvePromise(value);
    this._settled = true;

    return this;
  }

  reject(reason?: any): this {
    if (this._settled) {
      throw new Error('already resolved or rejected');
    }

    this.rejectPromise(reason);
    this._settled = true;

    return this;
  }

  reset(): this {
    this.backingPromise = new Promise<T>((resolve, reject) => {
      this.resolvePromise = resolve;
      this.rejectPromise = reject;
      this._settled = false;
    });

    return this;
  }
}
