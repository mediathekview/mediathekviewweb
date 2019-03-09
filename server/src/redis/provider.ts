import { Redis } from 'ioredis';

export interface RedisProvider {
  get(scope: string): Promise<Redis>;
}
