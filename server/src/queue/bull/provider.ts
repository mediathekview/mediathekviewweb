import * as Bull from 'bull';
import { RedisOptions } from 'ioredis';

import { QueueProvider, Queue } from '../';
import { BullQueue } from './queue';

const PREFIX = 'bull';

export class BullQueueProvider implements QueueProvider {
  private readonly redisOptions: RedisOptions | undefined;

  constructor(redisOptions?: RedisOptions) {
    this.redisOptions = redisOptions;
  }

  get<T>(key: string): Queue<T> {
    const queue = new Bull(key, { redis: this.redisOptions, prefix: PREFIX });
    return new BullQueue<T>(queue);
  }
}