import * as Redis from 'ioredis';
import { Observable, Subject } from 'rxjs';
import { Lock, LockedFunction } from '../../common/lock';
import { immediate, timeout, Timer } from '../../common/utils';
import { AcquireResult } from './acquire-result';


const EXPIRE_MS = 10000;
const RETRY_DELAY = 50;

export class RedisLock implements Lock {
  private readonly redis: Redis.Redis;
  private readonly key: string;
  private readonly id: string;
  private readonly lockLostSubject: Subject<void>;

  private isOwned: boolean = false;
  private stopLockLoop: Function = () => { };

  get lockLost(): Observable<void> {
    return this.lockLostSubject.asObservable();
  }

  constructor(redis: Redis.Redis, key: string, id: string) {
    this.redis = redis;
    this.key = key;
    this.id = id;
    this.lockLostSubject = new Subject();
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
    if (!this.isOwned) {
      return true;
    }

    this.stopLockLoop();

    const result = await (this.redis as any)['lock:release'](this.key, this.id);
    const success = (result == 1);

    if (success) {
      this.isOwned = false;
    }

    return success;
  }

  async owned(): Promise<boolean> {
    const result = await (this.redis as any)['lock:owned'](this.key, this.id);
    const success = (result == 1);

    this.isOwned = success;

    return success;
  }

  private refreshLoop(): () => void {
    let run = true;

    (async () => {
      while (run) {
        await timeout(EXPIRE_MS / 2.5);

        if (run) {
          const success = await this.tryRefresh();

          if (!success) {
            this.lockLostSubject.next();
            return;
          }
        }
      }
    })();

    return () => run = false;
  }

  private async tryAcquire(): Promise<AcquireResult> {
    const result = await (this.redis as any)['lock:acquire'](this.key, this.id, EXPIRE_MS) as AcquireResult;
    this.isOwned = (result == AcquireResult.Acquired) || (result == AcquireResult.Owned);

    return result;
  }

  private async tryRefresh(): Promise<boolean> {
    const result = await (this.redis as any)['lock:refresh'](this.key, this.id, EXPIRE_MS);
    const success = (result == 1);
    this.isOwned = success;

    return success;
  }
}
