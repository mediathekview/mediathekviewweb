import { Queue } from './queue';

export interface QueueProvider<IdType> {
  get<T>(key: string): Queue<T, IdType>;
}
