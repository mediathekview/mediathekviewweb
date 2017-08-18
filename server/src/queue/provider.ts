import * as Bull from 'bull';
import * as Redis from 'ioredis';
import config from '../config';

const REDIS_OPTIONS: Redis.RedisOptions = { host: config.redis.host, port: config.redis.port, db: config.redis.db };

export type ImportQueueType = { ressource: string, timestamp: number };

export class QueueProvider {
  constructor(private redis: Redis.Redis) { }

  getImportQueue(): Bull.Queue {
    return new Bull('filmlist-import', { prefix: 'queue:', redis: REDIS_OPTIONS });
  }
}
