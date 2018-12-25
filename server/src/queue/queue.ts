import { AsyncDisposable } from '../common/disposable/disposable';

export type Job<DataType> = { id: string, data: DataType; };
export type ProcessFunction<DataType> = (job: Job<DataType>) => Promise<void>;

export interface Queue<DataType> extends AsyncDisposable {
  initialize(): Promise<void>;

  enqueue(data: DataType): Promise<Job<DataType>>;
  enqueueMany(data: DataType[]): Promise<Job<DataType>[]>;

  acknowledge(...jobs: Job<DataType>[]): Promise<void>;

  getConsumer(throwOnError: boolean): AsyncIterableIterator<Job<DataType>>;
  getBatchConsumer(size: number, throwOnError: boolean): AsyncIterableIterator<Job<DataType>[]>;

  clear(): Promise<void>;
}
