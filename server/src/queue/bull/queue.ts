import { RedisOptions } from 'ioredis';
import * as Bull from 'bull';

import { Queue, ProcessFunction, Job, EnqueueOptions } from '../';
import { BullJob } from './job';
import { Serializer } from '../../serializer/serializer';

export class BullQueue<T> implements Queue<T> {
  private readonly queue: Bull.Queue;

  constructor(queue: Bull.Queue) {
    this.queue = queue;
  }

  enqueue(data: T): Promise<Job<T>>;
  enqueue(data: T, options: EnqueueOptions): Promise<Job<T>>;
  async enqueue(data: T, options?: EnqueueOptions): Promise<Job<T>> {
    const serializedData = Serializer.serialize(data);

    const bullOptions = this.enqueueOptionsToBullOptions(options);
    const job = await this.queue.add({ data: serializedData }, bullOptions);

    return new BullJob<T>(job);
  }

  process(processFunction: ProcessFunction<T>): void;
  process(concurrency: number, processFunction: ProcessFunction<T>): void;
  process(concurrencyOrFunc: number | ProcessFunction<T>, processFunction?: ProcessFunction<T>): void {
    let concurrency = 1;
    let func: ProcessFunction<T>;

    if (typeof concurrencyOrFunc == 'number') {
      concurrency = concurrencyOrFunc;
      func = processFunction as ProcessFunction<T>;
    } else {
      func = concurrencyOrFunc;
    }

    this.queue.process(concurrency, async (bullJob: Bull.Job) => {
      const job = new BullJob<T>(bullJob);
      try {
        await func(job);
      } catch (error) {
        console.error('error at processing queue-job', error);
        throw error;
      }
    });
  }

  async clean(): Promise<void> {
    await this.queue.clean(0, 'completed');
  }

  private enqueueOptionsToBullOptions(options: EnqueueOptions | undefined): Bull.JobOptions | undefined {
    let bullOptions: Bull.JobOptions | undefined;

    if (options != undefined) {
      bullOptions = {};

      if (options.jobID != undefined) {
        bullOptions.jobId = options.jobID;
        bullOptions.priority = options.priority;
      }
    }

    return bullOptions;
  }
}
