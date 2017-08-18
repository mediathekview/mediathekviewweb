import { ILock } from '../';
import * as Redis from 'ioredis';

export class RedisLock implements ILock {
  private relockTimeout: NodeJS.Timer;

  constructor(private key: string, private id: string, private redis: Redis.Redis) { }

  async lock(time?: number): Promise<boolean> {
    const result = await (this.redis as any).lock(this.key, this.id, (time == undefined) ? 1000 : time);

    if (result == 'OK') {
      if (time == undefined) {
        this.relockTimeout = setTimeout(() => this.lock(time), 500);
      }

      return true;
    }

    return false;
  }

  async unlock(): Promise<boolean> {
    clearTimeout(this.relockTimeout);
    const result = await (this.redis as any).unlock(this.key, this.id);
    return result == 1;
  }

  async haslock(): Promise<boolean> {
    const result = await (this.redis as any).haslock(this.key, this.id);
    return result == 1;
  }
}
