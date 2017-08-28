import { ILock } from '../';
import { sleep, random } from '../../common/utils';
import * as Redis from 'ioredis';

export class RedisLock implements ILock {
  private relockTimeout: NodeJS.Timer | null;

  constructor(private key: string, private id: string, private redis: Redis.Redis) { }

  async lock(time?: number): Promise<boolean> {
    this.clearTimeout();

    let result;
    for (let i = 0; i < 5; i++) {
      const _time = Math.floor((time == undefined) ? 1000 : time);

      if (_time <= 0) {
       throw new Error('cannot lock for zero or negative time');
      }

      result = await (this.redis as any).lock(this.key, this.id, _time);

      if (result == 'OK') {
        break;
      }

      const timeLeft = await this.timeLeft(false);
      await sleep(150 + (timeLeft / 2) + random(-50, 50, true));
    }

    if (result == 'OK') {
      if (time == undefined) {
        this.relockTimeout = setTimeout(() => this.lock(time), 500);
      }

      return true;
    }

    return false;
  }

  async unlock(): Promise<boolean> {
    this.clearTimeout();
    const result = await (this.redis as any).unlock(this.key, this.id);
    return result == 1;
  }

  async haslock(): Promise<boolean> {
    const result = await (this.redis as any).haslock(this.key, this.id);
    return result == 1;
  }

  async timeLeft(ownedOnly: boolean): Promise<number> {
    if (ownedOnly) {
      const has = await this.haslock();

      if (!has) {
        return 0;
      }
    }

    const result = await (this.redis as any).pttl(this.key);

    return Math.max(result, 0);
  }

  private clearTimeout() {
    clearTimeout(this.relockTimeout as NodeJS.Timer);
    this.relockTimeout = null;
  }
}
