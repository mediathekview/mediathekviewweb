import * as Kue from 'kue';
import { RedisOptions } from 'ioredis';

import { QueueProvider, Queue } from '../';
import { KueQueue } from './queue';

const PREFIX = 'kue';

export class KueQueueProvider implements QueueProvider {
  private readonly redisOptions: RedisOptions;

  constructor(redisOptions: RedisOptions) {
    this.redisOptions = redisOptions;
  }

  get<T>(key: string): Queue<T> {
    const queue = Kue.createQueue({ prefix: PREFIX, redis: this.redisOptions })
    return new KueQueue<T>(queue, key);
  }
}