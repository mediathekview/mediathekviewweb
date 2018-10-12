import { merge, Observable } from 'rxjs';
import { AsyncEnumerable } from '../enumerable';
import { immediate } from '../utils';
import { Lock, LockedFunction } from './lock';
import { LockProvider } from './provider';

export class MultiLock implements Lock {
  private readonly lockProvider: LockProvider;
  private readonly keys: string[];
  private readonly locks: Lock[];

  constructor(lockProvider: LockProvider, ...keys: string[]) {
    this.lockProvider = lockProvider;
    this.keys = keys;

    this.locks = keys.map((key) => lockProvider.get(key));
  }

  get lockLost(): Observable<void> {
    const lockLostObservables = this.locks.map((lock) => lock.lockLost);
    const observable = merge(...lockLostObservables);

    return observable;
  }

  async acquire(): Promise<boolean>;
  async acquire(timeout: number): Promise<boolean>;
  async acquire(func: LockedFunction): Promise<boolean>;
  async acquire(timeout: number, func: LockedFunction): Promise<boolean>;
  async acquire(funcOrTimeout?: number | LockedFunction, func?: LockedFunction): Promise<boolean> {
    let acquireTimeout = 1000;

    if (typeof funcOrTimeout == 'number') {
      acquireTimeout = funcOrTimeout;
    } else {
      func = funcOrTimeout;
    }

    const failed = AsyncEnumerable.from(this.locks)
      .parallelMap(5, false, async (lock) => {
        return await lock.acquire(acquireTimeout);
      })
      .any((result) => !result);

    if (failed) {
      return false;
    }

    if (func != undefined) {
      try {
        await func();
        await immediate();
      }
      finally {
        await this.release();
      }
    }

    return true;
  }

  async release(): Promise<boolean> {
    const failed = await AsyncEnumerable.from(this.locks)
      .parallelMap(5, false, async (lock) => {
        return await lock.release();
      })
      .any((result) => !result);

    return !failed;
  }

  async owned(): Promise<boolean> {
    const failed = await AsyncEnumerable.from(this.locks)
      .parallelMap(5, false, async (lock) => {
        return await lock.owned();
      })
      .any((result) => !result);

    return !failed;
  }
}