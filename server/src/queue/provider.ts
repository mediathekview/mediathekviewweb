import { Queue } from './queue';

export interface QueueProvider {
  get<T>(key: string, retryAfter: number, maxTries: number): Queue<T>;
}
