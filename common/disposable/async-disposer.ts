import { AsyncEnumerable } from '../enumerable';
import { DeferredPromise } from '../utils';
import { MultiError } from '../utils/multi-error';
import { AsyncDisposable } from './disposable';

export type DisposeTask = () => any | Promise<any>;

export type DisposeDeferrer = {
  yield(): void;
};

export class AsyncDisposer implements AsyncDisposable {
  private readonly disposedPromise: DeferredPromise;
  private readonly disposeDeferrers: Promise<void>[];
  private readonly disposeTasks: DisposeTask[];

  private _disposingPromise: DeferredPromise;
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
    this.disposeDeferrers = [];
    this.disposeTasks = [];

    this._disposingPromise = new DeferredPromise();
    this._disposing = false;
    this._disposed = false;
  }

  getDeferrer(): DisposeDeferrer {
    const deferredPromise = new DeferredPromise();
    this.disposeDeferrers.push(deferredPromise);

    const deferrer: DisposeDeferrer = {
      yield: () => deferredPromise.resolve()
    };

    return deferrer;
  }

  async defer<T>(deferrer: () => Promise<T>): Promise<T> {
    const disposeDeferrer = this.getDeferrer();

    try {
      return await deferrer();
    }
    finally {
      disposeDeferrer.yield();
    }
  }

  addDisposeTasks(...tasks: DisposeTask[]) {
    this.disposeTasks.push(...tasks);
  }

  async dispose(): Promise<void> {
    if (this.disposing) {
      return await this.disposedPromise;
    }

    this._disposing = true;
    this._disposingPromise.resolve();

    const errors: Error[] = [];

    await AsyncEnumerable.from(this.disposeDeferrers)
      .parallelForEach(10, async (disposeDeferrer) => {
        try {
          await disposeDeferrer;
        }
        catch (error) {
          errors.push(error);
        }
      });

    await AsyncEnumerable.from(this.disposeTasks)
      .parallelForEach(10, async (disposeTask) => {
        try {
          await disposeTask();
        }
        catch (error) {
          errors.push(error);
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
