import { Queue } from './queue';

export interface QueueProvider {
  get<T>(key: string, retryAfter: number): Queue<T>;
}
