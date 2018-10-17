import * as Bull from 'bull';
import { EnqueueOptions, Job, ProcessFunction, Queue } from '../';
import { Logger } from '../../common/logger';
import { Serializer } from '../../common/serializer';
import { BullJob } from './job';

export class BullQueue<T> implements Queue<T> {
  private readonly queue: Bull.Queue;
  private readonly serializer: Serializer;
  private readonly logger: Logger;

  constructor(queue: Bull.Queue, serializer: Serializer, logger: Logger) {
    this.queue = queue;
    this.serializer = serializer;
    this.logger = logger;
  }

  enqueue(data: T): Promise<Job<T>>;
  enqueue(data: T, options: EnqueueOptions): Promise<Job<T>>;
  async enqueue(data: T, options?: EnqueueOptions): Promise<Job<T>> {
    const serializedData = this.serializer.serialize(data);

    const bullOptions = this.enqueueOptionsToBullOptions(options);
    const bullJob = await this.queue.add({ data: serializedData }, bullOptions);
    const job = new BullJob<T>(bullJob, this.serializer);

    return job;
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
      const job = new BullJob<T>(bullJob, this.serializer);

      try {
        await func(job);
      } catch (error) {
        this.logger.error(`error at processing job: ${error}`);
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
