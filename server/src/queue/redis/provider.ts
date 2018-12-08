import { Redis } from 'ioredis';
import { LoggerFactory } from '../../common/logger';
import { QueueProvider } from '../provider';
import { Queue } from '../queue';
import { RedisQueue } from './queue';

export class RedisQueueProvider implements QueueProvider {
  private readonly redis: Redis;
  private readonly loggerFactory: LoggerFactory;
  private readonly loggerPrefix: string;

  constructor(redis: Redis, loggerFactory: LoggerFactory, loggerPrefix: string) {
    this.redis = redis;
    this.loggerFactory = loggerFactory;
    this.loggerPrefix = loggerPrefix;
  }

  get<DataType>(key: string): Queue<DataType> {
    const stream = `stream:${key}`;
    const group = `group:${key}`;
    const logger = this.loggerFactory.create(this.loggerPrefix);

    return new RedisQueue(this.redis, stream, group, logger);
  }
}
