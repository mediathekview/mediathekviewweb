const promiseConstructor = Promise;

export class DeferredPromise<T = void> implements Promise<T> {
  static all = promiseConstructor.all;
  static race = promiseConstructor.race;
  static resolve = promiseConstructor.resolve;
  static reject = promiseConstructor.reject;
  static [Symbol.species] = promiseConstructor;

  private backingPromise: Promise<T>;
  private resolvePromise: (value?: T | PromiseLike<T>) => void;
  private rejectPromise: (reason?: any) => void;

  private _resolved: boolean;
  private _rejected: boolean;

  readonly [Symbol.toStringTag] = 'Promise';

  get resolved(): boolean {
    return this._resolved;
  }

  get rejected(): boolean {
    return this._rejected;
  }

  get pending(): boolean {
    return !this._resolved && !this._rejected;
  }

  get settled(): boolean {
    return this._resolved || this._rejected;
  }

  constructor(executor?: (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void) {
    this.reset();

    if (executor != undefined) {
      executor((value) => this.resolve(value), (reason) => this.reject(reason));
    }
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
    this.ensurePendingState();

    this.resolvePromise(value);
    this._resolved = true;

    return this;
  }

  reject(reason?: any): this {
    this.ensurePendingState();

    this.rejectPromise(reason);
    this._rejected = true;

    return this;
  }

  reset(): this {
    this.backingPromise = new promiseConstructor<T>((resolve, reject) => {
      this.resolvePromise = resolve;
      this.rejectPromise = reject;
    });

    this._resolved = false;
    this._rejected = false;

    return this;
  }

  private ensurePendingState() {
    if (this.resolved) {
      throw new Error('promise already resolved');
    }

    if (this.rejected) {
      throw new Error('promise already rejected');
    }
  }
}
