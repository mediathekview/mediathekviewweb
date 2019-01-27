import { DeferredPromise } from '../promise/deferred-promise';

export class CancellationToken implements PromiseLike<void> {
  private readonly deferredPromise: DeferredPromise;
  private _isSet: boolean;

  constructor() {
    this.deferredPromise = new DeferredPromise();
  }

  get isSet(): boolean {
    return this._isSet;
  }

  set(): void {
    this._isSet = true;
    this.deferredPromise.resolve();
  }

  reset(): void {
    this._isSet = false;
    this.deferredPromise.reset();
  }

  // tslint:disable-next-line: promise-function-async
  then<TResult1, TResult2 = never>(onfulfilled?: ((value: void) => TResult1 | PromiseLike<TResult1>) | null | undefined, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined): Promise<TResult1 | TResult2> {
    return this.deferredPromise.then(onfulfilled, onrejected);
  }
}
