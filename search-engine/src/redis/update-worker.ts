import { IComperator } from '../comperator';
import { UpdateItem, UpdateCondition } from '../backend';
import { RedisBackend } from './';
import * as Redis from 'ioredis';

const batchBufferSize = 10;
const batchSize = 50;

export class UpdateWorker<T> {
  updateItems: UpdateItem<T>[];
  redis: Redis.Redis;

  existingValuesBatchBuffer: T[][] = [];

  constructor(updateItems: UpdateItem<T>[], redis: Redis.Redis, backend: RedisBackend<T>) {
    this.updateItems = updateItems;
    this.redis = redis;
  }

  async run() {
    return Promise.all([
      this.fillBuffer()
    ]);
  }

  async fillBuffer() {
    
  }
}
