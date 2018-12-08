import { AnyIterable } from '../common/utils';

export type Job<DataType> = { id: string, data: DataType; };
export type ProcessFunction<DataType> = (job: Job<DataType>) => Promise<void>;

export interface Queue<DataType> {
  enqueue(data: DataType): Promise<Job<DataType>>;
  enqueueMany(data: AnyIterable<DataType>): Promise<Job<DataType>[]>;

  getConsumer(): AsyncIterableIterator<Job<DataType>>;
  getBatchConsumer(size: number): AsyncIterableIterator<Job<DataType>[]>;

  acknowledge(job: Job<DataType>): Promise<void>;
  acknowledgeMany(jobs: AnyIterable<Job<DataType>>): Promise<void>;

  clean(): Promise<void>;
}
