import { IDatastoreProvider, IMap, ISortedSet, ITransaction, ISet, IKey } from '../';
import { RedisSet, RedisSortedSet, RedisMap, RedisKey, RedisTransaction } from './';
import { getUniqueID } from '../../utils';
import * as Redis from 'ioredis';

export class RedisDatastoreProvider implements IDatastoreProvider {
  constructor(private redis: Redis.Redis) {
    redis.defineCommand('zaddAggregate', {
      numberOfKeys: 1,
      lua: `local set = KEYS[1]
            local aggregator = ARGV[1]

            local i = 2
            while i <= #ARGV do
                local member = ARGV[i + 1]
                local score = tonumber(ARGV[i])
                local existingScore = tonumber(redis.call('zscore', set, member))

                local resultingScore = 0

                if (existingScore == nil) then
                    resultingScore = score
                elseif (aggregator == 'MAX') then
                    resultingScore = math.max(existingScore, score)
                elseif (aggregator == 'MIN') then
                    resultingScore = math.min(existingScore, score)
                elseif (aggregator == 'SUM') then
                    resultingScore = existingScore + score
                else
                    return redis.error_reply('invalid aggregator')
                end

                if (resultingScore ~= existingScore) then
                    redis.call('zadd', set, resultingScore, member)
                end

                i = i + 2
            end

            return (#ARGV - 1) / 2`
    });

    redis.defineCommand('hmsetSortedSetCondition', {
      numberOfKeys: 2,
      lua: `local hash = KEYS[1]
            local set = KEYS[2]
            local condition = ARGV[1]
            local conditionValue = tonumber(ARGV[2])

            local i = 3
            while i <= #ARGV do
                local field = ARGV[i]
                local value = ARGV[i + 1]
                local score = tonumber(redis.call('zscore', set, field))

                if (score == nil or (condition == 'GREATER' and score > conditionValue) or (condition == 'LESS' and score < conditionValue)) then
                    redis.call('hset', hash, field, value)
                end

                i = i + 2
            end

            return 'OK'`
    });
  }

  getKey<T>(key?: string): IKey<T> {
    if (key == undefined) {
      key = getUniqueID();
    }

    return new RedisKey<T>(key, this.redis);
  }

  getSet<T>(key?: string): ISet<T> {
    if (key == undefined) {
      key = getUniqueID();
    }

    return new RedisSet<T>(key, this.redis);
  }

  getSortedSet<T>(key?: string): ISortedSet<T> {
    if (key == undefined) {
      key = getUniqueID();
    }

    return new RedisSortedSet<T>(key, this.redis);
  }

  getMap<T>(key?: string): IMap<T> {
    if (key == undefined) {
      key = getUniqueID();
    }

    return new RedisMap<T>(key, this.redis);
  }

  getTransaction(): ITransaction {
    return new RedisTransaction(this.redis.multi());
  }
}
