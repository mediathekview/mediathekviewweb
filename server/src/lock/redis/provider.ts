import { Redis } from 'ioredis';

import { LockProvider } from '../../common/lock';
import { uniqueID } from '../../utils/unique-id';
import { RedisLock } from './';

export class RedisLockProvider implements LockProvider {
  private readonly redis: Redis;

  constructor(redis: Redis) {
    this.redis = redis;
    this.defineCommands();
  }

  get(key: string): RedisLock {
    key = `lock:${key}`;
    const id = uniqueID();

    const lock = new RedisLock(this.redis, key, id);
    return lock;
  }

  private defineCommands() {
    this.redis.defineCommand('lock:acquire', {
      numberOfKeys: 1,
      lua: `
            local key = KEYS[1]
            local id = ARGV[1]
            local expire = ARGV[2]

            local lockedID = redis.call("get", key)
            if (lockedID == id) then
              return "owned"
            end

            local result = redis.call("set", key, id, "NX", "PX", expire)
            if (result ~= false) then
              return "acquired"
            else
              return "failed"
            end`
    });

    this.redis.defineCommand('lock:refresh', {
      numberOfKeys: 1,
      lua: `
            local key = KEYS[1]
            local id = ARGV[1]
            local expire = ARGV[2]

            local acquired = (redis.call("exists", key) == 1)
            local success = 0

            if (acquired) then
              local lockedID = redis.call("get", key)

              if (lockedID == id) then
                local result = redis.call("set", key, id, "PX", expire)
            
                if (result ~= false) then
                  success = 1
                end
              end
            end

            return success`
    });

    this.redis.defineCommand('lock:release', {
      numberOfKeys: 1,
      lua: `
            local key = KEYS[1]
            local id = ARGV[1]

            local lockedID = redis.call("get", key)
            local success = 0

            if (lockedID == id) then
              success = redis.call("del", key)
            end
            
            return success`
    });

    this.redis.defineCommand('lock:owned', {
      numberOfKeys: 1,
      lua: `
            local key = KEYS[1]
            local id = ARGV[1]
            
            local lockedID = redis.call("get", key)
            local success = 0

            if (lockedID == id) then
              success = 1
            end
            
            return success`
    });
  }
}
