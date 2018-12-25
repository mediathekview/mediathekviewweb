import { AsyncEnumerable } from '../enumerable';
import { DeferredPromise } from '../utils';
import { MultiError } from '../utils/multi-error';
import { AsyncDisposable } from './disposable';

export type DisposeTask = () => any | Promise<any>;

export class AsyncDisposer implements AsyncDisposable {
  private readonly disposedPromise: DeferredPromise;
  private readonly disposeDeferrers: Promise<void>[];
  private readonly disposeTasks: DisposeTask[];
  private readonly subDisposables: AsyncDisposable[];

  private _disposing: boolean;
  private _disposed: boolean;

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
    this.subDisposables = [];
    this._disposing = false;
    this._disposed = false;
  }

  getDeferrer(): DeferredPromise {
    const deferredPromise = new DeferredPromise();
    this.disposeDeferrers.push(deferredPromise);

    return deferredPromise;
  }

  async defer<T>(deferrer: () => Promise<T>): Promise<T> {
    const disposeDeferrer = this.getDeferrer();

    try {
      return await deferrer();
    }
    finally {
      disposeDeferrer.resolve();
    }
  }

  addSubDisposables(...disposables: AsyncDisposable[]) {
    const subDisposablesTasks = this.subDisposables.map((disposable) => () => disposable.dispose());

    this.disposeTasks.push(...subDisposablesTasks);
    this.subDisposables.push(...disposables);
  }

  addDisposeTasks(...tasks: DisposeTask[]) {
    this.disposeTasks.push(...tasks);
  }

  async dispose(): Promise<void> {
    if (this.disposing) {
      return await this.disposedPromise;
    }

    this._disposing = true;

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
