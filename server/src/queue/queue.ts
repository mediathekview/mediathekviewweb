import { AsyncDisposable } from '../common/disposable/disposable';
import { CancellationToken } from '../common/utils/cancellation-token';

export type Job<DataType> = { id: string, data: DataType; };
export type ProcessFunction<DataType> = (job: Job<DataType>) => Promise<void>;

export interface Queue<DataType> extends AsyncDisposable {
  initialize(): Promise<void>;

  enqueue(data: DataType): Promise<Job<DataType>>;
  enqueueMany(data: DataType[]): Promise<Job<DataType>[]>;

  acknowledge(...jobs: Job<DataType>[]): Promise<void>;

  getConsumer(cancellationToken: CancellationToken): AsyncIterableIterator<Job<DataType>>;
  getBatchConsumer(size: number, cancellationToken: CancellationToken): AsyncIterableIterator<Job<DataType>[]>;

  clear(): Promise<void>;
}
