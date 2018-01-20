import { RedisOptions } from 'ioredis';
import * as Kue from 'kue';

import { Queue, ProcessFunction, Job, EnqueueOptions } from '../';
import { KueJob } from './job';
import { Serializer } from '../../serializer/serializer';

export class KueQueue<T> implements Queue<T> {
  private readonly queue: Kue.Queue;
  private readonly type: string;

  constructor(queue: Kue.Queue, type: string) {
    this.queue = queue;
    this.type = type;
  }

  enqueue(data: T): Promise<Job<T>>;
  enqueue(data: T, options: EnqueueOptions): Promise<Job<T>>;
  async enqueue(data: T, options?: EnqueueOptions): Promise<Job<T>> {
    const serializedData = Serializer.serialize(data);

    throw new Error('not implemented');

    const job = this.queue.createJob(this.type, serializedData);
    job.removeOnComplete(true);

    if (options != undefined && options.priority != undefined) {
      job.priority(options.priority);
    }

    job.save((error: any) => {

    });

    return new KueJob<T>(job);
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
      await func(job);
    });
  }

  async clean(): Promise<void> {
    await this.queue.clean(0);
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