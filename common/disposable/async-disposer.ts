import { AsyncEnumerable } from '../enumerable';
import { DeferredPromise } from '../promise';
import { MultiError } from '../utils/multi-error';
import { AsyncDisposable } from './disposable';

const deferrerPromiseSymbol: unique symbol = Symbol('DeferrerPromise');

export type Task = () => any | Promise<any>;

export type Deferrer = {
  [deferrerPromiseSymbol]: DeferredPromise;
  yield(): void;
};

export class AsyncDisposer implements AsyncDisposable {
  private readonly _disposingPromise: DeferredPromise;
  private readonly disposedPromise: DeferredPromise;
  private readonly deferrers: Set<Deferrer>;
  private readonly tasks: Set<Task>;

  private _disposing: boolean;
  private _disposed: boolean;

  get disposingPromise(): Promise<void> {
    return this._disposingPromise;
  }

  get disposing(): boolean {
    return this._disposing;
  }

  get disposed(): boolean {
    return this._disposed;
  }

  constructor() {
    this.disposedPromise = new DeferredPromise();
    this.deferrers = new Set();
    this.tasks = new Set();

    this._disposingPromise = new DeferredPromise();
    this._disposing = false;
    this._disposed = false;
  }

  getDeferrer(): Deferrer {
    const deferredPromise = new DeferredPromise();

    const deferrer: Deferrer = {
      [deferrerPromiseSymbol]: deferredPromise,
      yield: () => {
        deferredPromise.resolve();
        this.deferrers.delete(deferrer);
      }
    };

    this.deferrers.add(deferrer);

    return deferrer;
  }

  async defer<T>(func: () => Promise<T>): Promise<T> {
    const deferrer = this.getDeferrer();

    try {
      return await func();
    }
    finally {
      deferrer.yield();
    }
  }

  addDisposeTasks(...tasks: Task[]): void {
    for (const task of tasks) {
      this.tasks.add(task);
    }
  }

  async dispose(): Promise<void> {
    if (this.disposing) {
      await this.disposedPromise;
      return;
    }

    this._disposing = true;
    this._disposingPromise.resolve();

    const errors: Error[] = [];

    for (const deferrer of this.deferrers) {
      try {
        await deferrer[deferrerPromiseSymbol];
      }
      catch (error) {
        errors.push(error as Error);
      }
    }

    await AsyncEnumerable.from(this.tasks)
      .parallelForEach(10, async (task) => {
        try {
          const returnValue = task();

          if (returnValue instanceof Promise) {
            await returnValue;
          }
        }
        catch (error) {
          errors.push(error as Error);
        }
      });

    this._disposed = true;
    this.disposedPromise.resolve();

    if (errors.length == 1) {
      throw errors[0];
    }
    else if (errors.length > 1) {
      throw new MultiError(errors, 'dispose errors');
    }
  }
}
