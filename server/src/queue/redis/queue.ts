import * as Redis from 'ioredis';
import { Logger } from '../../common/logger';
import { Serializer } from '../../common/serializer';
import { DeferredPromise, AnyIterable, Nullable } from '../../common/utils';
import { uniqueId } from '../../utils';
import { groupExists } from '../../utils/redis';
import { Job, Queue } from '../queue';
import { AsyncEnumerable } from '../../common/enumerable';

type RedisJob<DataType> = Job<DataType>;

export class RedisQueue<DataType> implements Queue<DataType> {
  private readonly redis: Redis.Redis;
  private readonly stream: string;
  private readonly group: string;
  private readonly logger: Logger;
  private readonly initialized: DeferredPromise<void>;

  constructor(redis: Redis.Redis, stream: string, group: string, logger: Logger) {
    this.redis = redis;
    this.stream = stream;
    this.group = group;
    this.logger = logger;

    this.initialized = new DeferredPromise();
    this.initialize().catch((error) => this.logger.error(error));
  }

  private async initialize() {
    const exists = await groupExists(this.redis, this.stream, this.group);

    if (!exists) {
      await this.redis.xgroup('CREATE', this.stream, this.group, 0, 'MKSTREAM');
      this.logger.info(`created consumer group ${this.group}`);
    }

    this.initialized.resolve();
  }

  async enqueue(data: DataType): Promise<RedisJob<DataType>> {
    await this.initialized;

    const serializedData = Serializer.serialize(data);
    const id = await this.redis.xadd(this.stream, '*', 'data', serializedData) as string;
    const job: RedisJob<DataType> = { id, data };

    return job;
  }


  enqueueMany(data: AnyIterable<DataType>): Promise<Job<DataType>[]> {
    return AsyncEnumerable.from(data)
      .batch(50)
      .parallelMap(3, true, async (batch) => {
        const pipeline = this.redis.pipeline();

        for (const data of batch) {
          const serializedData = Serializer.serialize(data);
          pipeline.xadd(this.stream, '*', 'data', serializedData);
        }

        const results = await pipeline.exec() as [Nullable<Error>, string][];

        for (const [error, id] of results) {
          if (error != null) {
            throw error;
          }
        }

        return results.map(([_error, id], index) => ({ id, data: batch[index] }));
      })
      .mapMany((results) => results)
      .toArray();
  }

  async *getConsumer(): AsyncIterableIterator<Job<DataType>> {
    await this.initialized;

    const consumer = this.getConsumerName();

    while (true) {
      const data = await this.redis.xreadgroup('GROUP', this.group, consumer, 'BLOCK');
      yield data;
    }
  }

  async *getBatchConsumer(size: number): AsyncIterableIterator<Job<DataType>[]> {
    await this.initialized;

    const consumer = this.getConsumerName();

    while (true) {
      const data = await this.redis.xreadgroup('GROUP', this.group, consumer, 'COUNT', size, 'BLOCK');
      yield* data;
    }
  }

  async clean(): Promise<void> {
    const deletedEntriesCount = await this.redis.xtrim(this.stream, 'MAXLEN', 0) as number;
  }

  private getConsumerName(): string {
    return uniqueId();
  }
}
