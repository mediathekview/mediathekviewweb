export type Job<DataType, IdType> = { id: IdType, data: DataType; };
export type ProcessFunction<DataType, IdType> = (job: Job<DataType, IdType>) => Promise<void>;

export interface Queue<DataType, IdType> {
  enqueue(data: DataType): Promise<Job<DataType, IdType>>;

  process(concurrency: number, processFunction: ProcessFunction<DataType, IdType>): void;
  process(processFunction: ProcessFunction<DataType, IdType>): void;

  clean(): Promise<void>;
}
