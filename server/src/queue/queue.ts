import { Job } from './job';

export type EnqueueOptions = { jobID?: number | string, priority?: number };
export type ProcessFunction<T> = (job: Job<T>) => Promise<void>;

export interface Queue<T> {
  enqueue(data: T): Promise<Job<T>>;
  enqueue(data: T, options: EnqueueOptions): Promise<Job<T>>;
  
  process(concurrency: number, processFunction: ProcessFunction<T>): void;
  process(processFunction: ProcessFunction<T>): void;

  clean(): Promise<void>;
}
