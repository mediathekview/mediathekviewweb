import * as Redis from 'ioredis';
import { AsyncDisposable, AsyncDisposer } from '../../common/disposable';
import { LockProvider } from '../../common/lock';
import { Logger } from '../../common/logger';
import { Serializer } from '../../common/serializer';
import { currentTimestamp, DeferredPromise } from '../../common/utils';
import { DistributedLoop, DistributedLoopProvider } from '../../distributed-loop';
import { RedisProvider } from '../../redis/provider';
import { RedisStream, SourceEntry } from '../../redis/stream';
import { uniqueId } from '../../utils';
import { Job, Queue } from '../queue';

type StreamEntryType = { retries: string, enqueueTimestamp: string, data: string };
type RedisJob<DataType> = Job<DataType>;

const BLOCK_DURATION = 2500;
const MINIMUM_CONSUMER_IDLE_TIME_BEFORE_DELETION = 10000;

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
  private readonly maxRetries: number;
  private readonly logger: Logger;
  private readonly distributedRetryLoop: DistributedLoop;
  private readonly consumerDeleteLoop: DistributedLoop;
  private readonly initialized: DeferredPromise;

  constructor(redis: Redis.Redis, redisProvider: RedisProvider, lockProvider: LockProvider, distributedLoopProvider: DistributedLoopProvider, key: string, retryAfter: number, maxRetries: number, logger: Logger) {
    this.redisProvider = redisProvider;
    this.lockProvider = lockProvider;
    this.distributedLoopProvider = distributedLoopProvider;
    this.key = key;
    this.streamName = `stream:${key}`;
    this.groupName = `queue`;
    this.retryAfter = retryAfter;
    this.maxRetries = maxRetries;
    this.logger = logger;

    this.disposer = new AsyncDisposer();
    this.stream = new RedisStream(redis, this.streamName, false);
    this.initialized = new DeferredPromise();
    this.distributedRetryLoop = distributedLoopProvider.get(`queue:${key}:retry`);
    this.consumerDeleteLoop = distributedLoopProvider.get(`queue:${key}:consumer-delete`);

    this.disposer.deferDispose(async () => await this.initialized);

    this.initialize().catch((error) => this.logger.error(error));
  }

  private async initialize() {
    const lock = this.lockProvider.get(`stream:initialize:${this.groupName}`);

    await lock.acquire(Number.MAX_SAFE_INTEGER, async () => {
      const hasGroup = await this.stream.hasGroup(this.groupName);

      if (!hasGroup) {
        await this.stream.createGroup(this.groupName, '0', true);
        this.logger.info(`created consumer group ${this.groupName}`);
      }
    });

    this.distributedRetryLoop.run((_controller) => this.retryPendingEntries(), this.retryAfter, this.retryAfter / 2);
    this.consumerDeleteLoop.run((_controller) => this.deleteInactiveConsumers(), 3000, 1500);

    this.initialized.resolve();
  }

  async dispose(): Promise<void> {
    await this.disposer.dispose();
  }

  private async getConsumerStream(): Promise<RedisStream<StreamEntryType>> {
    const consumerRedis = await this.redisProvider.get('CONSUMER');
    const consumerStream = new RedisStream<StreamEntryType>(consumerRedis, this.streamName, true);

    this.disposer.addSubDisposables(consumerStream);

    return consumerStream;
  }

  async enqueue(data: DataType): Promise<RedisJob<DataType>> {
    await this.initialized;

    const serializedData = Serializer.serialize(data);
    const entry: SourceEntry<StreamEntryType> = { data: { retries: '0', enqueueTimestamp: currentTimestamp().toString(), data: serializedData } };

    const id = await this.stream.add(entry);
    const job: RedisJob<DataType> = { id, data };

    return job;
  }

  async enqueueMany(data: DataType[]): Promise<Job<DataType>[]> {
    const serializedData = data.map((item) => Serializer.serialize(item));
    const entries: SourceEntry<StreamEntryType>[] = serializedData.map((serializedData) => ({ data: { retries: '0', enqueueTimestamp: currentTimestamp().toString(), data: serializedData } }));

    const ids = await this.stream.addMany(entries);

    const jobs: RedisJob<DataType>[] = ids.map((id, index) => ({ id, data: data[index] }));
    return jobs;
  }

  async acknowledge(...jobs: Job<DataType>[]): Promise<void> {
    const ids = jobs.map((job) => job.id);
    await this.stream.acknowledgeDeleteTransaction(this.groupName, ids);
  }

  async *getConsumer(): AsyncIterableIterator<Job<DataType>> {
    const batchConsumer = this.getBatchConsumer(1);

    for await (const batch of batchConsumer) {
      yield* batch;
    }
  }

  async *getBatchConsumer(batchSize: number): AsyncIterableIterator<Job<DataType>[]> {
    const disposeDeferrer = this.disposer.getDisposeDeferrer();

    try {
      await this.initialized;

      const consumerStream = await this.getConsumerStream();
      const consumer = this.getConsumerName();
      const lock = this.lockProvider.get(consumer);

      const success = await lock.acquire();

      if (!success) {
        throw new Error('failed acquiring lock');
      }

      try {
        while (!this.disposer.disposed) {
          const entries = await consumerStream.readGroup({ id: '>', group: this.groupName, consumer, block: BLOCK_DURATION, count: batchSize });
          const jobs: Job<DataType>[] = entries
            .map(({ id, data: { data: serializedData } }) => ({ id, serializedData }))
            .map(({ id, serializedData }) => ({ id, data: Serializer.deserialize(serializedData) }));

          if (jobs.length > 0) {
            yield jobs;
          }
        }
      }
      finally {
        try {
          await lock.release();
        }
        catch (error) {
          this.logger.error(error);
        }
      }
    }
    finally {
      disposeDeferrer.resolve();
    }
  }

  async clear(): Promise<void> {
    await this.stream.trim(0, false);
  }

  private async deleteInactiveConsumers(): Promise<void> {
    this.disposer.deferDispose(async () => {
      const consumers = await this.stream.getConsumers(this.groupName);

      const consumersToDelete = consumers
        .filter((consumer) => consumer.pending == 0)
        .filter((consumer) => consumer.idle >= MINIMUM_CONSUMER_IDLE_TIME_BEFORE_DELETION)

      for (const consumer of consumersToDelete) {
        const lock = this.lockProvider.get(consumer.name);

        await lock.acquire(0, async () => {
          await this.stream.deleteConsumer(this.groupName, consumer.name);
          this.logger.info(`deleted consumer ${consumer.name} from ${this.streamName}`);
        });
      }
    });
  }

  private async retryPendingEntries(): Promise<void> {
    this.disposer.deferDispose(async () => {
      const pendingEntries = await this.stream.getPendingEntries({ group: this.groupName, start: '-', end: '+', count: 50 });
      const ids = pendingEntries
        .filter((entry) => entry.elapsed > this.retryAfter)
        .map((entry) => entry.id);

      if (ids.length == 0) {
        return;
      }

      const entries = await this.stream.getMany(ids);
      const entriesWithTriesLeft = entries.filter((entry) => parseInt(entry.data.retries) < this.maxRetries);

      const retryEntries = entriesWithTriesLeft.map(({ data: { retries, data } }) => {
        const retryEntry: SourceEntry<StreamEntryType> = {
          data: {
            retries: (parseInt(retries) + 1).toString(),
            enqueueTimestamp: currentTimestamp().toString(),
            data
          }
        };

        return retryEntry;
      });

      if (retryEntries.length > 0) {
        const newIds = await this.stream.acknowledgeDeleteAddTransaction(this.groupName, ids, retryEntries);
      }
    });
  }

  private getConsumerName(): string {
    return uniqueId();
  }
}
