import * as Redis from 'ioredis';
import { Observable, Subject } from 'rxjs';
import { Lock, LockedFunction } from '../../common/lock';
import { Logger } from '../../common/logger';
import { DeferredPromise, immediate, timeout, Timer } from '../../common/utils';
import { AcquireResult } from './acquire-result';

const LOCK_DURATION = 10000;
const RETRY_DELAY = 50;

export class RedisLock implements Lock {
  private readonly redis: Redis.Redis;
  private readonly logger: Logger;
  private readonly key: string;
  private readonly id: string;
  private readonly lockLostSubject: Subject<void>;

  private expireTimestamp: number = 0;
  private stopLockLoop: () => Promise<void> = () => Promise.resolve();

  private get millisecondsLeft(): number {
    return this.expireTimestamp - Date.now();
  }

  get owned(): boolean {
    return this.expireTimestamp > Date.now();
  }

  get lockLost(): Observable<void> {
    return this.lockLostSubject.asObservable();
  }

  constructor(redis: Redis.Redis, key: string, id: string, logger: Logger) {
    this.redis = redis;
    this.logger = logger;
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
      success = ((result == AcquireResult.Acquired) || (result == AcquireResult.Owned));

      if (!success && (timer.milliseconds < acquireTimeout)) {
        await timeout(RETRY_DELAY);
      }
    } while (!success && (timer.milliseconds < acquireTimeout));

    if (success) {
      this.stopLockLoop = this.refreshLoop();

      if (func != undefined) {
        try {
          await func();
          await immediate();
        }
        finally {
          await this.release(false);
        }
      }
    }

    return success;
  }

  async release(): Promise<boolean>;
  async release(force: boolean): Promise<boolean>;
  async release(force: boolean = false): Promise<boolean> {
    await this.stopLockLoop();

    const result = await (this.redis as any)['lock:release'](this.key, this.id, force ? 1 : 0);
    const success = (result == 1);

    if (success) {
      this.expireTimestamp = 0;
    }

    return success;
  }

  async exists(): Promise<boolean> {
    const result = await this.redis.exists(this.key);
    return result == 1;
  }

  async forceUpdateOwned(): Promise<void> {
    this.expireTimestamp = await (this.redis as any)['lock:owned'](this.key, this.id) as number;
  }

  private refreshLoop(): () => Promise<void> {
    const stopped = new DeferredPromise();

    let run = true;
    let error: Error | null = null;

    (async () => {
      while (run && this.owned) {
        try {
          const success = await this.tryRefresh();

          if (!success) {
            await this.forceUpdateOwned();
          }

          error = null;
        }
        catch (refreshError) {
          error = refreshError;
        }

        const delay = Math.max(this.millisecondsLeft * 0.25, RETRY_DELAY);
        await timeout(delay);
      }

      if (error != null) {
        this.logger.error(error);
      }

      if (run) {
        this.lockLostSubject.next();
      }

      stopped.resolve();
    })();

    const stopFunction = () => {
      run = false;
      return stopped;
    };

    return stopFunction;
  }

  private async tryAcquire(): Promise<AcquireResult> {
    const expireTimestamp = this.getNewExpireTimestamp();

    const result = await (this.redis as any)['lock:acquire'](this.key, this.id, expireTimestamp) as AcquireResult;

    if (result == AcquireResult.Acquired) {
      this.expireTimestamp = expireTimestamp;
    }

    return result;
  }

  private async tryRefresh(): Promise<boolean> {
    const expireTimestamp = this.getNewExpireTimestamp();

    const result = await (this.redis as any)['lock:refresh'](this.key, this.id, expireTimestamp);
    const success = (result == 1);

    if (success) {
      this.expireTimestamp = expireTimestamp;
    }

    return success;
  }

  private getNewExpireTimestamp(): number {
    return Date.now() + LOCK_DURATION;
  }
}
