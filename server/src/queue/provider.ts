import * as Bull from 'bull';
import * as Redis from 'ioredis';

export type ImportQueueType = { ressource: string, timestamp: number };
export type IndexEntriesType = { idsSetKey: string, amount: number };

export class QueueProvider {
  constructor(private redisOptions: Redis.RedisOptions) { }

  getImportQueue(): Bull.Queue {
    return new Bull('filmlist-import', { prefix: 'queue', redis: this.redisOptions });
  }

  getIndexEntriesQueue():Bull.Queue {
    return new Bull('index-entries', { prefix: 'queue', redis: this.redisOptions });
  }
}
