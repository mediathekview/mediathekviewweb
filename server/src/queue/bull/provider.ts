import * as Bull from 'bull';

import { RedisOptions } from 'ioredis';
import { Queue, QueueProvider } from '../';
import { LoggerFactory } from '../../common/logger';
import { BullQueue } from './queue';
import { Serializer } from '../../serializer';

const REDIS_PREFIX = 'bull';

export class BullQueueProvider implements QueueProvider {
  private readonly redisOptions: RedisOptions | undefined;
  private readonly loggerFactory: LoggerFactory;
  private readonly loggerPrefix: string;
  private readonly serializer: Serializer;

  constructor(serializer: Serializer, loggerFactory: LoggerFactory, loggerPrefix: string, redisOptions?: RedisOptions) {
    this.serializer = serializer;
    this.loggerFactory = loggerFactory;
    this.loggerPrefix = loggerPrefix;
    this.redisOptions = redisOptions;
  }

  get<T>(key: string): Queue<T> {
    const queue = new Bull(key, { redis: this.redisOptions, prefix: REDIS_PREFIX });
    const logger = this.loggerFactory.create(this.loggerPrefix);

    return new BullQueue<T>(queue, this.serializer, logger);
  }
}
