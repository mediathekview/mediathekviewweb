import { Queue } from './queue';

export interface QueueProvider {
  get<T>(key: string, retryAfter: number, maxRetries: number): Queue<T>;
}
