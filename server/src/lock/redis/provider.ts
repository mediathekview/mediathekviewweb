import * as Redis from 'ioredis';
import { getUniqueID } from '../../utils';
import { RedisLock } from './';
import { ILockProvider, ILock } from '../';

export class RedisLockProvider implements ILockProvider {
  constructor(private redis: Redis.Redis) {
    redis.defineCommand('lock', {
      numberOfKeys: 1,
      lua: `if (redis.call("get", KEYS[1]) ~= ARGV[1] and redis.call("exists", KEYS[1]) == 1) then
                return 0
            end

            return redis.call("set", KEYS[1], ARGV[1], "PX", ARGV[2])`
    });

    redis.defineCommand('unlock', {
      numberOfKeys: 1,
      lua: `if redis.call("get", KEYS[1]) == ARGV[1] then
                return redis.call("del", KEYS[1])
            else
                return 0
            end`
    });

    redis.defineCommand('haslock', {
      numberOfKeys: 1,
      lua: `if redis.call("get", KEYS[1]) == ARGV[1] then
                return 1
            else
                return 0
            end`
    });
  }

  getLock(key: string): ILock {
    const id = getUniqueID();
    return new RedisLock(key, id, this.redis);
  }
}
