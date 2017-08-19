import * as Bull from 'bull';
import * as Redis from 'ioredis';

export type ImportQueueType = { ressource: string, timestamp: number };

export class QueueProvider {
  constructor(private redisOptions: Redis.RedisOptions) { }

  getImportQueue(): Bull.Queue {
    return new Bull('filmlist-import', { prefix: 'queue:', redis: this.redisOptions });
  }
}
