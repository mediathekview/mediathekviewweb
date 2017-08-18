import { ITransaction } from '../';
import * as Redis from 'ioredis';

export class RedisTransaction implements ITransaction {
  pipeline: Redis.Pipeline;

  constructor(pipeline: Redis.Pipeline) {
    this.pipeline = pipeline;
  }

  async exec() {
    return this.pipeline.exec();
  }
}
