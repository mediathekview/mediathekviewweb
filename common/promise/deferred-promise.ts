const promiseConstructor = Promise;

export class DeferredPromise<T = void> implements Promise<T> {
  // tslint:disable: typedef
  static all = promiseConstructor.all.bind(promiseConstructor);
  static race = promiseConstructor.race.bind(promiseConstructor);
  static resolve = promiseConstructor.resolve.bind(promiseConstructor);
  static reject = promiseConstructor.reject.bind(promiseConstructor);
  static [Symbol.species] = promiseConstructor;
  // tslint:enable: typedef

  private backingPromise: Promise<T>;
  private resolvePromise: (value?: T | PromiseLike<T>) => void;
  private rejectPromise: (reason?: any) => void; // tslint:disable-line: no-any

  private _resolved: boolean;
  private _rejected: boolean;

  readonly [Symbol.toStringTag]: string = 'Promise';

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

  // tslint:disable-next-line: promise-function-async
  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null | undefined, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined): Promise<TResult1 | TResult2> {
    return this.backingPromise.then(onfulfilled, onrejected);
  }

  // tslint:disable-next-line: promise-function-async
  catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null | undefined): Promise<T | TResult> {
    return this.backingPromise.catch(onrejected);
  }

  // tslint:disable-next-line: promise-function-async
  finally(onfinally?: (() => void) | null | undefined): Promise<T> {
    return this.backingPromise.finally(onfinally);
  }

  resolve(value?: T | PromiseLike<T>): void {
    this.ensurePendingState();

    this.resolvePromise(value);
    this._resolved = true;
  }

  // tslint:disable-next-line: no-any
  reject(reason?: any): void {
    this.ensurePendingState();

    this.rejectPromise(reason);
    this._rejected = true;
  }

  reset(): void {
    this.backingPromise = new promiseConstructor<T>((resolve, reject) => {
      this.resolvePromise = resolve;
      this.rejectPromise = reject;
    });

    this._resolved = false;
    this._rejected = false;
  }

  private ensurePendingState(): void {
    if (this.resolved) {
      throw new Error('promise already resolved');
    }

    if (this.rejected) {
      throw new Error('promise already rejected');
    }
  }
}
