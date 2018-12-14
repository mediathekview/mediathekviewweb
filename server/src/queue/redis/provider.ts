import { Redis } from 'ioredis';
import { LockProvider } from '../../common/lock';
import { LoggerFactory } from '../../common/logger';
import { QueueProvider } from '../provider';
import { Queue } from '../queue';
import { RedisQueue } from './queue';
import { DistributedLoopProvider } from '../../distributed-loop';
import { RedisProvider } from '../../redis/provider';

export class RedisQueueProvider implements QueueProvider {
  private readonly redis: Redis;
  private readonly redisProvider: RedisProvider;
  private readonly lockProvider: LockProvider;
  private readonly distributedLoopProvider: DistributedLoopProvider;
  private readonly loggerFactory: LoggerFactory;
  private readonly loggerPrefix: string;

  constructor(redis: Redis, redisProvider: RedisProvider, lockProvider: LockProvider, distributedLoopProvider: DistributedLoopProvider, loggerFactory: LoggerFactory, loggerPrefix: string) {
    this.redis = redis;
    this.redisProvider = redisProvider;
    this.lockProvider = lockProvider;
    this.distributedLoopProvider = distributedLoopProvider;
    this.loggerFactory = loggerFactory;
    this.loggerPrefix = loggerPrefix;
  }

  get<DataType>(key: string, retryAfter: number): Queue<DataType> {
    const logger = this.loggerFactory.create(this.loggerPrefix);

    return new RedisQueue(this.redis, this.redisProvider, this.lockProvider, this.distributedLoopProvider, key, retryAfter, logger);
  }
}
