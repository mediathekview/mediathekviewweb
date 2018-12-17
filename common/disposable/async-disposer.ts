import { AsyncEnumerable } from '../enumerable';
import { DeferredPromise } from '../utils';
import { MultiError } from '../utils/multi-error';
import { AsyncDisposable } from './disposable';

export class AsyncDisposer implements AsyncDisposable {
  private readonly disposeDeferrers: Promise<void>[];
  private readonly subDisposables: AsyncDisposable[];

  private _disposed: boolean;

  get disposed(): boolean {
    return this._disposed;
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

  addSubDisposables(...disposable: AsyncDisposable[]) {
    this.subDisposables.push(...disposable);
  }

  async dispose(): Promise<void> {
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

    await AsyncEnumerable.from(this.subDisposables)
      .parallelForEach(10, async (subDisposable) => {
        try {
          await subDisposable.dispose();
        }
        catch (error) {
          errors.push(error);
        }
      });

    if (errors.length == 1) {
      throw errors[0];
    }
    else if (errors.length > 1) {
      throw new MultiError(errors, 'dispose errors');
    }
  }
}
