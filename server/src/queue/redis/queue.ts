import { AsyncDisposable, AsyncDisposer } from '@common-ts/base/disposable';
import { LockProvider } from '@common-ts/base/lock';
import { Logger } from '@common-ts/base/logger';
import { Serializer } from '@common-ts/base/serializer';
import { cancelableTimeout, currentTimestamp } from '@common-ts/base/utils';
import { CancellationToken } from '@common-ts/base/utils/cancellation-token';
import { DistributedLoop, DistributedLoopProvider } from '@common-ts/server/distributed-loop';
import { uniqueIdSync } from '@common-ts/server/utils';
import * as Redis from 'ioredis';
import { RedisProvider } from '../../redis/provider';
import { Entry, RedisStream, SourceEntry } from '../../redis/stream';
import { Job, Queue } from '../queue';

type StreamEntryType = { retries: string, enqueueTimestamp: string, data: string };
type RedisJob<DataType> = Job<DataType>;

const BLOCK_DURATION = 2500;
const MINIMUM_CONSUMER_IDLE_TIME_BEFORE_DELETION = 600000;

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
  private readonly retryLoop: DistributedLoop;
  private readonly consumerDeleteLoop: DistributedLoop;

  constructor(redis: Redis.Redis, redisProvider: RedisProvider, lockProvider: LockProvider, distributedLoopProvider: DistributedLoopProvider, key: string, retryAfter: number, maxRetries: number, logger: Logger) {
    this.redisProvider = redisProvider;
    this.lockProvider = lockProvider;
    this.distributedLoopProvider = distributedLoopProvider;
    this.key = key;
    this.streamName = `stream:${key}`;
    this.groupName = 'queue';
    this.retryAfter = retryAfter;
    this.maxRetries = maxRetries;
    this.logger = logger;

    this.disposer = new AsyncDisposer();
    this.stream = new RedisStream(redis, this.streamName);
    this.retryLoop = distributedLoopProvider.get(`queue:${key}:retry`);
    this.consumerDeleteLoop = distributedLoopProvider.get(`queue:${key}:consumer-delete`);
  }

  async initialize(): Promise<void> {
    const lock = this.lockProvider.get(`queue:${this.key}:initialize`);

    const lockController = await lock.acquire(2500, async () => {
      const hasGroup = await this.stream.hasGroup(this.groupName);

      if (!hasGroup) {
        await this.stream.createGroup(this.groupName, '0', true);
        this.logger.debug(`created consumer group ${this.groupName}`);
      }
    });

    if (!lockController) {
      throw new Error('could not acquire lock for initialization');
    }

    const retryLoopController = this.retryLoop.run(async (_controller) => await this.retryPendingEntries(), this.retryAfter, this.retryAfter / 2);
    const consumerDeleteLoopController = this.consumerDeleteLoop.run(async (_controller) => await this.deleteInactiveConsumers(), 3000, 1500);

    this.disposer.addDisposeTasks(async () => await retryLoopController.stop());
    this.disposer.addDisposeTasks(async () => await consumerDeleteLoopController.stop());
  }

  async dispose(): Promise<void> {
    await this.disposer.dispose();
  }

  async enqueue(data: DataType): Promise<RedisJob<DataType>> {
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

  async *getConsumer(cancellationToken: CancellationToken): AsyncIterableIterator<Job<DataType>> {
    const batchConsumer = this.getBatchConsumer(1, cancellationToken);

    for await (const batch of batchConsumer) {
      if (cancellationToken.isSet || this.disposer.disposing) {
        break;
      }

      yield* batch;
    }
  }

  async *getBatchConsumer(batchSize: number, cancellationToken: CancellationToken): AsyncIterableIterator<Job<DataType>[]> {
    const disposeDeferrer = this.disposer.getDeferrer();

    try {
      const consumerStream = await this.getConsumerStream();
      const consumer = this.getConsumerName();
      const lock = this.lockProvider.get(`queue:${this.key}:${consumer}`);

      const lockController = await lock.acquire(1000);

      if (!lockController) {
        throw new Error('failed acquiring lock');
      }

      try {
        while (!cancellationToken.isSet && !this.disposer.disposing) {
          let entries: Entry<StreamEntryType>[] | undefined;

          while (entries == undefined && !cancellationToken.isSet && !this.disposer.disposing) {
            try {
              entries = await consumerStream.readGroup({ id: '>', group: this.groupName, consumer, block: BLOCK_DURATION, count: batchSize });
            }
            catch (error) {
              this.logger.error(error as Error);
              await cancelableTimeout(2500, this.disposer.disposingPromise);
            }
          }

          if (cancellationToken.isSet || this.disposer.disposing) {
            break;
          }

          const jobs: Job<DataType>[] = (entries as Entry<StreamEntryType>[])
            .map(({ id, data: { data: serializedData } }) => ({ id, serializedData }))
            .map(({ id, serializedData }) => ({ id, data: Serializer.deserialize(serializedData) }));

          if (jobs.length > 0) {
            yield jobs;
          }
        }
      }
      finally {
        try {
          await lockController.release();
        }
        catch (error) {
          this.logger.error(error); // tslint:disable-line: no-unsafe-any
        }
      }
    }
    finally {
      disposeDeferrer.yield();
    }
  }

  async clear(): Promise<void> {
    await this.stream.trim(0, false);
  }

  private async getConsumerStream(): Promise<RedisStream<StreamEntryType>> {
    const consumerRedis = await this.redisProvider.get('CONSUMER');
    const consumerStream = new RedisStream<StreamEntryType>(consumerRedis, this.streamName);

    return consumerStream;
  }

  private async deleteInactiveConsumers(): Promise<void> {
    await this.disposer.defer(async () => {
      const consumers = await this.stream.getConsumers(this.groupName);

      const consumersToDelete = consumers
        .filter((consumer) => consumer.pending == 0)
        .filter((consumer) => consumer.idle >= MINIMUM_CONSUMER_IDLE_TIME_BEFORE_DELETION);

      for (const consumer of consumersToDelete) {
        const lock = this.lockProvider.get(consumer.name);

        await lock.acquire(100, async () => {
          await this.stream.deleteConsumer(this.groupName, consumer.name);
          this.logger.debug(`deleted consumer ${consumer.name} from ${this.streamName}`);
        });

        if (this.disposer.disposing) {
          break;
        }
      }
    });
  }

  private async retryPendingEntries(): Promise<void> {
    await this.disposer.defer(async () => {
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
    return uniqueIdSync(20);
  }
}
