import { AnyIterable } from '../common/utils';

export type Job<DataType> = { id: string, data: DataType; };
export type ProcessFunction<DataType> = (job: Job<DataType>) => Promise<void>;

export interface Queue<DataType> {
  enqueue(data: DataType): Promise<Job<DataType>>;
  enqueueMany(data: AnyIterable<DataType>): Promise<Job<DataType>[]>;

  getConsumer(throwOnError: boolean): AsyncIterableIterator<Job<DataType>>;
  getBatchConsumer(size: number, throwOnError: boolean): AsyncIterableIterator<Job<DataType>[]>;

  clear(): Promise<void>;
}
