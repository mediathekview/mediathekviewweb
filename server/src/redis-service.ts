import * as Redis from 'ioredis';

import { Utils } from './utils';
import { Entry } from './model';

export class RedisKeys {
  static FilmlisteTimestamp = 'parser:filmlisteTimestamp';
  static Entries = 'parser:entries';
  static NewEntries = 'parser:newEntries';
  static AddedEntries = 'parser:addedEntries';
  static RemovedEntries = 'parser:removedEntries';
  static EntriesToBeAddedSet = 'indexer:toBeAdded';
  static EntriesToBeRemovedSet = 'indexer:toBeRemoved';
}

export class RedisService {
  private static _instance: RedisService;
  private redis: Redis.Redis;

  private constructor() {
    this.redis = new Redis();
  }

  static getInstance(): RedisService {
    if (this._instance == undefined) {
      this._instance = new RedisService();
    }

    return this._instance;
  }

  set(key: string, value: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.redis.set(key, value, (error, reply) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  get(key: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.redis.get(key, (error, reply) => {
        if (error) {
          reject(error);
        } else {
          resolve(reply);
        }
      });
    });
  }

  del(key: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.redis.del(key, (error, reply) => {
        if (error) {
          reject(error);
        } else {
          resolve(reply == '1');
        }
      });
    });
  }

  rename(key: string, newKey: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.redis.rename(key, newKey, (error, reply) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  sadd(key: string, members: any[]): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      this.redis.sadd(key, members, (error, reply) => {
        if (error) {
          reject(error);
        } else {
          resolve(reply);
        }
      });
    });
  }

  zadd(key: string, scoresAndMembers: (string | number)[]): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      this.redis.zadd(key, scoresAndMembers, (error, reply) => {
        if (error) {
          reject(error);
        } else {
          resolve(reply);
        }
      });
    });
  }

  sismember(key: string, value: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.redis.sismember(key, value, (error, reply) => {
        if (error) {
          reject(error);
        } else {
          resolve(parseInt(reply) == 1);
        }
      });
    });
  }

  srem(key: string, members: string[]): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      this.redis.srem(key, members, (error, reply) => {
        if (error) {
          reject(error);
        } else {
          resolve(reply);
        }
      });
    });
  }

  spop(key: string, count: number = 1): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      this.redis.spop(key, count, (error, reply) => {
        if (error) {
          reject(error);
        } else {
          resolve(reply);
        }
      });
    });
  }

  zrange(key: string, start: number, stop: number, withScores: boolean = false): Promise<{ member: string, score: number }[]> {
    return new Promise<{ member: string, score: number }[]>((resolve, reject) => {
      let args = [key, start, stop];
      if (withScores) {
        args.push('WITHSCORES');
      }
      this.redis.zrange(...args, (error, reply) => {
        if (error) {
          reject(error);
        } else {
          let result: { member: string, score: number }[] = [];

          for (let i = 0; i < reply.length; i += 2) {
            result.push({ member: reply[i], score: parseFloat(reply[i + 1]) });
          }

          resolve(result);
        }
      });
    });
  }

  zremrangebyrank(key: string, start: number, stop: number): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      this.redis.zremrangebyrank(key, start, stop, (error, reply) => {
        if (error) {
          reject(error);
        } else {
          resolve(reply);
        }
      });
    });
  }

  scard(key: string): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      this.redis.scard(key, (error, reply) => {
        if (error) {
          reject(error);
        } else {
          resolve(parseInt(reply));
        }
      });
    });
  }

  sinterstore(destination: string, ...keys: string[]): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      this.redis.sinterstore(destination, ...keys, (error, reply) => {
        if (error) {
          reject(error);
        } else {
          resolve(parseInt(reply));
        }
      });
    });
  }

  sdiffstore(destination: string, ...keys: string[]): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      this.redis.sdiffstore(destination, ...keys, (error, reply) => {
        if (error) {
          reject(error);
        } else {
          resolve(parseInt(reply));
        }
      });
    });
  }

  sunionstore(destination: string, ...keys: string[]): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      this.redis.sunionstore(destination, ...keys, (error, reply) => {
        if (error) {
          reject(error);
        } else {
          resolve(parseInt(reply));
        }
      });
    });
  }
}
