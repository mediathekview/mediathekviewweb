import { Queue, EnqueueOptions, Job, ProcessFunction } from '../queue';
import * as Redis from 'ioredis';
import { Serializer } from '../../common/serializer';

export type RedisJobId = { base: number, sequence: number };

type RedisJob<DataType> = Job<DataType, RedisJobId>;

export class RedisQueue<DataType> implements Queue<DataType, RedisJobId> {
  private readonly redis: Redis.Redis;
  private readonly key: string;

  constructor(redis: Redis.Redis) {
    this.redis = redis;
  }

  async enqueue(data: DataType): Promise<RedisJob<DataType>> {
    const serializedData = Serializer.serialize(data);

    const id = await this.redis.xadd(this.key, '*', 'data', serializedData);

    const job: RedisJob<DataType> = {
      id
    };

    return job;
  }

  process(concurrency: number, processFunction: ProcessFunction<DataType, RedisJobId>): void;
  process(processFunction: ProcessFunction<DataType, RedisJobId>): void;
  process(concurrencyOrProcessFunction: number | ProcessFunction<DataType, RedisJobId>, processFunction?: ProcessFunction<DataType, RedisJobId>): void {
    let concurrency = 1;

    if (typeof concurrencyOrProcessFunction == 'number') {
      concurrency = concurrencyOrProcessFunction;
    } else {
      processFunction = concurrencyOrProcessFunction;
    }

    throw new Error("Method not implemented.");
  }

  clean(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
