import { Redis } from 'ioredis';
import { LockProvider } from '../../common/lock';
import { Logger } from '../../common/logger';
import { uniqueId } from '../../utils/unique-id';
import { RedisLock } from './lock';

export class RedisLockProvider implements LockProvider {
  private readonly redis: Redis;
  private readonly logger: Logger;

  constructor(redis: Redis, logger: Logger) {
    this.redis = redis;
    this.logger = logger;

    this.defineCommands();
  }

  get(key: string): RedisLock {
    key = `lock:${key}`;
    const id = uniqueId();

    const lock = new RedisLock(this.redis, key, id, this.logger);
    return lock;
  }

  private defineCommands() {
    this.redis.defineCommand('lock:acquire', {
      numberOfKeys: 1,
      lua: `
            local key = KEYS[1]
            local id = ARGV[1]
            local expireTimestamp = ARGV[2]

            local lockedId = redis.call("get", key)
            if (lockedId == id) then
              return "owned"
            end

            if (lockedId ~= nil) then
              return "failed"
            end

            local result = (redis.call("set", key, id, "NX") ~= false)
            if (result == true) then
              result = (redis.call("pexpireat", key, expireTimestamp) == 1)
            end

            if (result == true)
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
            local expireTimestamp = ARGV[2]

            local lockedId = redis.call("get", key)
            local success = 0

            if (lockedId == id) then
              success = redis.call("pexpireat", key, expireTimestamp)
            end

            return success`
    });

    this.redis.defineCommand('lock:release', {
      numberOfKeys: 1,
      lua: `
            local key = KEYS[1]
            local id = ARGV[1]
            local force = ARGV[2]

            local lockedId = redis.call("get", key)
            local success = 0

            if (lockedId == id) or (force == 1) then
              success = redis.call("del", key)
            end

            return success`
    });

    this.redis.defineCommand('lock:owned', {
      numberOfKeys: 1,
      lua: `
            local key = KEYS[1]
            local id = ARGV[1]

            local lockedId = redis.call("get", key)
            local result = 0

            if (lockedId == id) then
              local millisecondsLeft = redis.call("pttl", key)
              local time = redis.call("time")
              local timestamp = (millisecondsLeft + (time[1] * 1000) + math.floor(time[2] / 1000))
              result = timestamp
            end

            return result`
    });
  }
}
