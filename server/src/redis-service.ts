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

  sadd(key: string, ...values: any[]): Promise<number> {
    let args: any[] = [key].concat(values);
    return new Promise<number>((resolve, reject) => {
      this.redis.sadd(args, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  sismember(key: string, value: any): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.redis.sismember(key, value, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result == 1);
        }
      });
    });
  }

  srem(key: string, ...values: any[]): Promise<number> {
    let args: any[] = [key].concat(values);
    return new Promise<number>((resolve, reject) => {
      this.redis.srem(args, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }
}
