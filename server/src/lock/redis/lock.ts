import * as Redis from 'ioredis';

import { Observable, Subject } from 'rxjs';
import { Lock, LockedFunction } from '../../common/lock';
import { Timer, immediate, timeout } from '../../common/utils';
import { AcquireResult } from './acquire-result';

const EXPIRE_MS = 10000;
const RETRY_DELAY = 50;

export class RedisLock implements Lock {
  private readonly redis: Redis.Redis;
  private readonly key: string;
  private readonly id: string;
  private readonly onLockLostSubject: Subject<void>;

  private stopLockLoop: Function = () => { };

  get onLockLost(): Observable<void> {
    return this.onLockLostSubject;
  }

  constructor(redis: Redis.Redis, key: string, id: string) {
    this.redis = redis;
    this.key = key;
    this.id = id;
    this.onLockLostSubject = new Subject();
  }

  /**
   * @param 
   */
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

    const timer = new Timer(true);
    let success = false;

    do {
      const result = await this.tryAcquire();

      if (result == AcquireResult.Owned) {
        return false;
      }
      success = result == AcquireResult.Acquired;

      if (!success) {
        await timeout(RETRY_DELAY);
      }
    } while (!success && (acquireTimeout > 0) && (timer.milliseconds < acquireTimeout));


    if (success) {
      this.stopLockLoop = this.refreshLoop();

      if (func != undefined) {
        try {
          await func();
          await immediate();
        }
        finally {
          await this.release();
        }
      }
    }

    return success;
  }

  async release(): Promise<boolean> {
    this.stopLockLoop();

    const result = await (this.redis as any)['lock:release'](this.key, this.id);
    return result == 1;
  }

  async owned(): Promise<boolean> {
    const result = await (this.redis as any)['lock:owned'](this.key, this.id);
    return result == 1;
  }

  private refreshLoop(): () => void {
    let run = true;

    (async () => {
      while (run) {
        await timeout(EXPIRE_MS / 2.5);

        if (run) {
          const success = await this.tryRefresh();

          if (!success) {
            this.onLockLostSubject.next();
            return;
          }
        }
      }
    })();

    return () => run = false;
  }

  private async tryAcquire(): Promise<AcquireResult> {
    const result = await (this.redis as any)['lock:acquire'](this.key, this.id, EXPIRE_MS);
    return result as AcquireResult;
  }

  private async tryRefresh(): Promise<boolean> {
    const result = await (this.redis as any)['lock:refresh'](this.key, this.id, EXPIRE_MS);
    return result == 1;
  }
}
