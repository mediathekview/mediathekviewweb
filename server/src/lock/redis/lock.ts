import * as Redis from 'ioredis';
import { Lock, LockController, LockedFunction } from '../../common/lock';
import { Logger } from '../../common/logger';
import { cancelableTimeout, currentTimestamp, DeferredPromise, immediate, timeout, Timer } from '../../common/utils';
import { uniqueId } from '../../utils';
import { AcquireResult } from './acquire-result';

const LOCK_DURATION = 10000;
const RETRY_DELAY = 50;

export class RedisLock implements Lock {
  private readonly redis: Redis.Redis;
  private readonly logger: Logger;
  private readonly key: string;

  constructor(redis: Redis.Redis, key: string, logger: Logger) {
    this.redis = redis;
    this.logger = logger;
    this.key = key;
  }

  async acquire(): Promise<LockController | false>;
  async acquire(timeout: number): Promise<LockController | false>;
  async acquire(func: LockedFunction): Promise<LockController | false>;
  async acquire(timeout: number, func: LockedFunction): Promise<LockController | false>;
  async acquire(funcOrTimeout?: number | LockedFunction, func?: LockedFunction): Promise<LockController | false> {
    const id = uniqueId();

    let acquireTimeout = 1000;

    if (typeof funcOrTimeout == 'number') {
      acquireTimeout = funcOrTimeout;
    } else {
      func = funcOrTimeout;
    }

    const newExpireTimestamp = await this._acquire(id, acquireTimeout);

    if (newExpireTimestamp == -1) {
      return false;
    }

    let stopRefresh = false;
    let stopPromise = new DeferredPromise();
    let stoppedPromise = new DeferredPromise();
    let expireTimestamp = newExpireTimestamp;

    const controller: LockController = {
      get lost(): boolean {
        return (expireTimestamp < currentTimestamp());
      },
      release: async () => {
        if (stopRefresh) {
          return await stoppedPromise;
        }

        stopRefresh = true;
        stopPromise.resolve();
        await stoppedPromise;
        await this.release(id);
        expireTimestamp = -1;
      }
    };

    (async () => {
      while (!stopRefresh && !controller.lost) {
        try {
          const newExpireTimestamp = this.getNewExpireTimestamp();
          const success = await this.refresh(id, newExpireTimestamp);

          if (success) {
            expireTimestamp = newExpireTimestamp;
          }
        }
        catch (error) {
          this.logger.error(error);
        }

        const millisecondsLeft = (expireTimestamp - currentTimestamp());
        const delay = Math.max(millisecondsLeft * 0.5, RETRY_DELAY);
        await cancelableTimeout(stopPromise, delay);
      }

      stoppedPromise.resolve();
    })();

    if (func != undefined) {
      try {
        await func(controller);
        await immediate();
      }
      finally {
        await this.release(id, false);
      }
    }

    return controller;
  }

  private async _acquire(id: string, acquireTimeout: number): Promise<number> {
    const timer = new Timer(true);
    let expireTimestamp = -1;

    while ((expireTimestamp == -1) && (timer.milliseconds < acquireTimeout)) {
      const newExpireTimestamp = this.getNewExpireTimestamp();
      const result = await this.tryAcquire(id, newExpireTimestamp);

      if ((result == AcquireResult.Acquired) || (result == AcquireResult.Owned)) {
        expireTimestamp = newExpireTimestamp;
      }

      if ((expireTimestamp == -1) && (timer.milliseconds < acquireTimeout)) {
        await timeout(RETRY_DELAY);
      }
    }

    return expireTimestamp;
  }

  private async release(id: string): Promise<boolean>;
  private async release(id: string, force: boolean): Promise<boolean>;
  private async release(id: string, force: boolean = false): Promise<boolean> {
    const result = await (this.redis as any)['lock:release'](this.key, id, force ? 1 : 0);
    const success = (result == 1);

    return success;
  }

  async exists(): Promise<boolean> {
    const result = await this.redis.exists(this.key);
    return result == 1;
  }

  async getExpireTimestamp(id: string): Promise<number> {
    const expireTimestamp = await (this.redis as any)['lock:owned'](this.key, id) as number;
    return expireTimestamp;
  }

  private async tryAcquire(id: string, expireTimestamp: number): Promise<AcquireResult> {
    const result = await (this.redis as any)['lock:acquire'](this.key, id, expireTimestamp) as AcquireResult;
    return result;
  }

  private async refresh(id: string, expireTimestamp: number): Promise<boolean> {
    const result = await (this.redis as any)['lock:refresh'](this.key, id, expireTimestamp);
    const success = (result == 1);

    return success;
  }

  private getNewExpireTimestamp(): number {
    return Date.now() + LOCK_DURATION;
  }
}
