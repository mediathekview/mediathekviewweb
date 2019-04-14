import { LockProvider } from '@common-ts/base/lock';
import { Logger } from '@common-ts/base/logger';
import { DistributedLoopProvider } from '@common-ts/server/distributed-loop';
import { Redis } from 'ioredis';
import { RedisProvider } from '../../redis/provider';
import { QueueProvider } from '../provider';
import { Queue } from '../queue';
import { RedisQueue } from './queue';

export class RedisQueueProvider implements QueueProvider {
  private readonly redis: Redis;
  private readonly redisProvider: RedisProvider;
  private readonly lockProvider: LockProvider;
  private readonly distributedLoopProvider: DistributedLoopProvider;
  private readonly logger: Logger;

  constructor(redis: Redis, redisProvider: RedisProvider, lockProvider: LockProvider, distributedLoopProvider: DistributedLoopProvider, logger: Logger) {
    this.redis = redis;
    this.redisProvider = redisProvider;
    this.lockProvider = lockProvider;
    this.distributedLoopProvider = distributedLoopProvider;
    this.logger = logger;
  }

  get<DataType>(key: string, retryAfter: number, maxRetries: number): Queue<DataType> {
    const logger = this.logger.prefix(`[${key}] `);
    return new RedisQueue(this.redis, this.redisProvider, this.lockProvider, this.distributedLoopProvider, key, retryAfter, maxRetries, logger);
  }
}
