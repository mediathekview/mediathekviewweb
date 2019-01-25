import { forceShutdownPromise } from '../../process-shutdown';
import { AsyncEnumerable } from '../enumerable';
import { DeferredPromise } from '../utils';
import { MultiError } from '../utils/multi-error';
import { differenceSets } from '../utils/set';
import { AsyncDisposable } from './disposable';

export type DisposeTask = () => any | Promise<any>;

export type DisposeDeferrer = {
  yield(): void;
};

export class AsyncDisposer implements AsyncDisposable {
  private readonly _disposingPromise: DeferredPromise;
  private readonly disposedPromise: DeferredPromise;
  private readonly deferrers: Set<Promise<void>>;
  private readonly tasks: Set<DisposeTask>;
  private readonly finishedTasks: Set<DisposeTask>;

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
    this.finishedTasks = new Set();

    this._disposingPromise = new DeferredPromise();
    this._disposing = false;
    this._disposed = false;

    // tslint:disable-next-line: no-floating-promises
    forceShutdownPromise.then(() => {
      if (!this.disposing) {
        console.log('deferrers', this.deferrers.size);

        const unfinishedTasks = differenceSets(this.tasks, this.finishedTasks);
        for (const task of unfinishedTasks) {
          console.log(task.toString());
        }
      }
    });
  }

  getDeferrer(): DisposeDeferrer {
    const deferredPromise = new DeferredPromise();
    this.deferrers.add(deferredPromise);

    const deferrer: DisposeDeferrer = {
      yield: () => {
        deferredPromise.resolve();
        this.deferrers.delete(deferredPromise);
      }
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

  addDisposeTasks(...tasks: DisposeTask[]): void {
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

    await AsyncEnumerable.from(this.deferrers)
      .parallelForEach(10, async (deferrer) => {
        try {
          await deferrer;
        }
        catch (error) {
          errors.push(error as Error);
        }
      });

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
        finally {
          this.finishedTasks.add(task);
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
