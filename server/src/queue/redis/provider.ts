import { Redis } from 'ioredis';
import { LockProvider } from '../../common/lock';
import { Logger } from '../../common/logger';
import { DistributedLoopProvider } from '../../distributed-loop';
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
  private readonly loggerPrefix: string;

  constructor(redis: Redis, redisProvider: RedisProvider, lockProvider: LockProvider, distributedLoopProvider: DistributedLoopProvider, logger: Logger, loggerPrefix: string) {
    this.redis = redis;
    this.redisProvider = redisProvider;
    this.lockProvider = lockProvider;
    this.distributedLoopProvider = distributedLoopProvider;
    this.logger = logger;
    this.loggerPrefix = loggerPrefix;
  }

  get<DataType>(key: string, retryAfter: number, maxRetries: number): Queue<DataType> {
    const logger = this.logger.prefix(`${this.loggerPrefix} [${key}] `);
    return new RedisQueue(this.redis, this.redisProvider, this.lockProvider, this.distributedLoopProvider, key, retryAfter, maxRetries, logger);
  }
}
