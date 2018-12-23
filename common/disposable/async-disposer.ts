import { AsyncEnumerable } from '../enumerable';
import { DeferredPromise } from '../utils';
import { MultiError } from '../utils/multi-error';
import { AsyncDisposable } from './disposable';

export class AsyncDisposer implements AsyncDisposable {
  private readonly disposedPromise: DeferredPromise;
  private readonly disposeDeferrers: Promise<void>[];
  private readonly disposeTasks: (() => void | Promise<void>)[];
  private readonly subDisposables: AsyncDisposable[];

  private _disposed: boolean;

  get disposed(): boolean {
    return this._disposed;
  }

  constructor() {
    this.disposedPromise = new DeferredPromise();
    this.disposeDeferrers = [];
    this.disposeTasks = [];
    this.subDisposables = [];
    this._disposed = false;
  }

  getDisposeDeferrer(): DeferredPromise {
    const deferredPromise = new DeferredPromise();
    this.disposeDeferrers.push(deferredPromise);

    return deferredPromise;
  }

  async deferDispose<T>(deferrer: () => Promise<T>): Promise<T> {
    const disposeDeferrer = this.getDisposeDeferrer();

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

  addDisposeTasks(...task: (() => any | Promise<any>)[]) {
    this.disposeTasks.push(...task);
  }

  async dispose(): Promise<void> {
    if (this.disposed) {
      return await this.disposedPromise;
    }

    this._disposed = true;

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

    this.disposedPromise.resolve();

    if (errors.length == 1) {
      throw errors[0];
    }
    else if (errors.length > 1) {
      throw new MultiError(errors, 'dispose errors');
    }
  }
}
