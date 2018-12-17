import * as Redis from 'ioredis';
import { AsyncDisposable, AsyncDisposer } from '../../common/disposable';
import { LockProvider } from '../../common/lock';
import { Logger } from '../../common/logger';
import { Serializer } from '../../common/serializer';
import { DeferredPromise } from '../../common/utils';
import { DistributedLoop, DistributedLoopProvider } from '../../distributed-loop';
import { RedisProvider } from '../../redis/provider';
import { RedisStream, SourceEntry } from '../../redis/stream';
import { uniqueId } from '../../utils';
import { Job, Queue } from '../queue';

type StreamEntryType = { data: string };
type RedisJob<DataType> = Job<DataType>;

export class RedisQueue<DataType> implements AsyncDisposable, Queue<DataType> {
  private readonly disposer: AsyncDisposer;
  private readonly redisProvider: RedisProvider;
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

  constructor(redis: Redis.Redis, redisProvider: RedisProvider, lockProvider: LockProvider, distributedLoopProvider: DistributedLoopProvider, key: string, retryAfter: number, logger: Logger) {
    this.redisProvider = redisProvider;
    this.lockProvider = lockProvider;
    this.distributedLoopProvider = distributedLoopProvider;
    this.key = key;
    this.streamName = `stream:${key}`;
    this.groupName = `queue`;
    this.retryAfter = retryAfter;
    this.logger = logger;

    this.disposer = new AsyncDisposer();
    this.stream = new RedisStream(redis, this.streamName, false);
    this.initialized = new DeferredPromise();
    this.distributedClaimLoop = distributedLoopProvider.get(`queue:${key}`);

    this.disposer.deferDispose(async () => await this.initialized);

    this.initialize().catch((error) => this.logger.error(error));
  }

  private async initialize() {
    const hasGroup = await this.stream.hasGroup(this.groupName);

    if (!hasGroup) {
      await this.stream.createGroup(this.groupName, '0', true);
      this.logger.info(`created consumer group ${this.groupName}`);
    }

    //  this.distributedClaimLoop.run((_controller) => this.claim(), 10000, 3000);

    this.initialized.resolve();
  }

  async dispose(): Promise<void> {
    await this.disposer.dispose();
  }

  private async getConsumerStream(): Promise<RedisStream<StreamEntryType>> {
    const consumerRedis = await this.redisProvider.get('CONSUMER');
    const consumerStream = new RedisStream<StreamEntryType>(consumerRedis, this.streamName, true);

    this.disposer.addSubDisposable(consumerStream);

    return consumerStream;
  }

  async enqueue(data: DataType): Promise<RedisJob<DataType>> {
    await this.initialized;

    const serializedData = Serializer.serialize(data);
    const entry: SourceEntry<StreamEntryType> = { data: { data: serializedData } };

    const id = await this.stream.add(entry);
    const job: RedisJob<DataType> = { id, data };

    return job;
  }

  async enqueueMany(data: DataType[]): Promise<Job<DataType>[]> {
    const serializedData = data.map((item) => Serializer.serialize(item));
    const entries: SourceEntry<StreamEntryType>[] = serializedData.map((serializedData) => ({ data: { data: serializedData } }));

    const ids = await this.stream.addMany(entries);

    const jobs: RedisJob<DataType>[] = ids.map((id, index) => ({ id, data: data[index] }));
    return jobs;
  }

  async acknowledge(...jobs: Job<DataType>[]): Promise<void> {
    const ids = jobs.map((job) => job.id);
    await this.stream.acknowledge(this.groupName, ...ids);
  }

  async *getConsumer(throwOnError: boolean): AsyncIterableIterator<Job<DataType>> {
    const disposeDeferrer = this.disposer.getDisposeDeferrer();

    await this.initialized;

    try {
      const consumerStream = await this.getConsumerStream();
      const consumer = this.getConsumerName();
      const lock = this.lockProvider.get(consumer);

      const success = await lock.acquire();

      if (!success) {
        throw new Error('failed acquiring lock');
      }

      try {
        while (!this.disposer.disposed) {
          const entries = await consumerStream.readGroup({ id: '>', group: this.groupName, consumer, block: 2500, count: 1 });
          const jobs: Job<DataType>[] = entries
            .map(({ id, data: { data: serializedData } }) => ({ id, serializedData }))
            .map(({ id, serializedData }) => ({ id, data: Serializer.deserialize(serializedData) }));

          for (const job of jobs) {
            try {
              yield job;
            }
            catch (error) {
              if (throwOnError) {
                throw error;
              }

              this.logger.error(error);
            }
          }
        }
      }
      finally {
        lock.release();
      }
    }
    finally {
      disposeDeferrer.resolve();
    }
  }

  async *getBatchConsumer(batchSize: number, throwOnError: boolean): AsyncIterableIterator<Job<DataType>[]> {
    const disposeDeferrer = this.disposer.getDisposeDeferrer();

    await this.initialized;

    try {
      const consumerStream = await this.getConsumerStream();
      const consumer = this.getConsumerName();
      const lock = this.lockProvider.get(consumer);

      const success = await lock.acquire();

      if (!success) {
        throw new Error('failed acquiring lock');
      }

      try {
        while (!this.disposer.disposed) {
          const entries = await consumerStream.readGroup({ id: '>', group: this.groupName, consumer, block: 2500, count: batchSize });
          const jobs: Job<DataType>[] = entries
            .map(({ id, data: { data: serializedData } }) => ({ id, serializedData }))
            .map(({ id, serializedData }) => ({ id, data: Serializer.deserialize(serializedData) }));

          try {
            if (jobs.length > 0) {
              yield jobs;
            }
          }
          catch (error) {
            if (throwOnError) {
              throw error;
            }

            this.logger.error(error);
          }
        }
      }
      finally {
        await lock.release();
      }
    }
    finally {
      disposeDeferrer.resolve();
    }
  }

  async clear(): Promise<void> {
    await this.stream.trim(0, false);
  }

  private async claim(): Promise<void> {
    this.disposer.deferDispose(async () => {
      const consumers = await this.stream.getConsumers(this.groupName);

      for (const consumer of consumers) {
        const tryTakeMeasure = consumer.idle
      }
    });

    throw Error('not implemented');
  }

  private getConsumerName(): string {
    return uniqueId();
  }
}
