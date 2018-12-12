import * as Redis from 'ioredis';
import { AsyncEnumerable } from '../../common/enumerable';
import { LockProvider } from '../../common/lock';
import { Logger } from '../../common/logger';
import { Serializer } from '../../common/serializer';
import { AnyIterable, DeferredPromise, Nullable } from '../../common/utils';
import { DistributedLoop, DistributedLoopProvider } from '../../distributed-loop';
import { RedisStream, SourceEntry } from '../../redis/stream';
import { uniqueId } from '../../utils';
import { Job, Queue } from '../queue';

type StreamEntryType = { data: string };
type RedisJob<DataType> = Job<DataType>;

export class RedisQueue<DataType> implements Queue<DataType> {
  //private readonly redis: Redis.Redis;
  private readonly stream: RedisStream<StreamEntryType>;
  private readonly lockProvider: LockProvider;
  private readonly distributedLoopProvider: DistributedLoopProvider;
  private readonly key: string;
  private readonly streamName: string;
  private readonly groupName: string;
  private readonly retryAfter: number;
  private readonly logger: Logger;
  private readonly distributedClaimLoop: DistributedLoop;
  private readonly initialized: DeferredPromise<void>;

  constructor(redis: Redis.Redis, lockProvider: LockProvider, distributedLoopProvider: DistributedLoopProvider, key: string, retryAfter: number, logger: Logger) {
    this.redis = redis;
    this.lockProvider = lockProvider;
    this.distributedLoopProvider = distributedLoopProvider;
    this.key = key;
    this.streamName = `stream:${key}`;
    this.groupName = `group:${key}`;
    this.retryAfter = retryAfter;
    this.logger = logger;

    this.stream = new RedisStream(this.redis, this.streamName);
    this.initialized = new DeferredPromise();
    this.distributedClaimLoop = distributedLoopProvider.get(`queue:${key}`);

    this.initialize().catch((error) => this.logger.error(error));
  }

  private async initialize() {
    const hasGroup = await this.stream.hasGroup(this.groupName);

    if (!hasGroup) {
      await this.stream.createGroup(this.groupName, '0', true);
      this.logger.info(`created consumer group ${this.groupName}`);
    }

    this.distributedClaimLoop.run((_controller) => this.claim(), 10000, 3000);

    this.initialized.resolve();
  }

  async enqueue(data: DataType): Promise<RedisJob<DataType>> {
    await this.initialized;

    const serializedData = Serializer.serialize(data);
    const entry: SourceEntry<StreamEntryType> = { data: { data: serializedData } };

    const id = await this.stream.add(entry);
    const job: RedisJob<DataType> = { id, data };

    return job;
  }

  async enqueueMany(data: AnyIterable<DataType>): Promise<Job<DataType>[]> {
    return await AsyncEnumerable.from(data)
      .map((data) => {
        const serializedData = Serializer.serialize(data);
        const entry: SourceEntry<StreamEntryType> = { data: { data: serializedData } };

        return { data, entry };
      })
      .batch(50)
      .parallelMap(3, true, async (batch) => {
        const entries = batch.map((item) => item.entry);
        const ids = await this.stream.addMany(entries);

        const jobs: RedisJob<DataType>[] = ids.map((id, index) => ({ id, data: batch[index].data }));
        return jobs;
      })
      .mapMany((results) => results)
      .toArray();
  }

  async *getConsumer(): AsyncIterableIterator<Job<DataType>> {
    await this.initialized;

    const consumer = this.getConsumerName();
    const lock = this.lockProvider.get(consumer);

    await lock.acquire();

    try {
      while (true) {
        const data = await this.redis.xreadgroup('GROUP', this.groupName, consumer, 'BLOCK');
        yield data;
      }
    }
    finally {
      lock.release();
    }
  }

  async *getBatchConsumer(size: number): AsyncIterableIterator<Job<DataType>[]> {
    await this.initialized;

    const consumer = this.getConsumerName();
    const lock = this.lockProvider.get(consumer);

    await lock.acquire();

    try {
      while (true) {
        const data = await this.redis.xreadgroup('GROUP', this.groupName, consumer, 'COUNT', size, 'BLOCK');
        yield* data;
      }
    }
    finally {
      lock.release();
    }
  }

  async acknowledge(job: Job<DataType>): Promise<void> {
    await this.redis.xack(this.streamName, this.groupName, job.id);
  }

  async acknowledgeMany(jobs: AnyIterable<Job<DataType>>): Promise<void> {
    await AsyncEnumerable.from(jobs)
      .batch(50)
      .parallelForEach(3, async (batch) => {
        const ids = batch.map((job) => job.id);
        await this.redis.xack(this.streamName, this.groupName, ...ids);
      });
  }

  async clean(): Promise<void> {
    const deletedEntriesCount = await this.redis.xtrim(this.streamName, 'MAXLEN', 0) as number;
  }

  private getConsumerName(): string {
    return uniqueId();
  }

  async claim(): Promise<void> {
    const consumers


    throw Error('not implemented');
  }

  private async getPendingMessagesOfConsumer(consumer: string) {
    let messageCount = 1000;
    const pendingMessages = await this.redis.xpending(this.streamName, this.groupName, '-', '+', messageCount, consumer);
  }
}
