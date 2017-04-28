import * as Redis from 'ioredis';

import { Utils } from './utils';
import { Entry } from './model';

export class RedisKeys {
  static FilmlisteTimestamp = 'filmliste:timestamp';
  static EntriesToBeAddedSet = 'entries:toBeAdded';
  static EntriesToBeRemovedSet = 'entries:toBeRemoved';
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

  private set(key: string, value: string): Promise<void> {
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

  private get(key: string): Promise<string> {
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

  setFilmlisteTimestamp(timestamp: number): Promise<void> {
    return this.set(RedisKeys.FilmlisteTimestamp, timestamp.toString());
  }

  getFilmlisteTimestamp(): Promise<number> {
    return this.get(RedisKeys.FilmlisteTimestamp).then(Utils.parseIntAsync);
  }

  getEntriesToBeAddedBatch(batchSize: number): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      this.redis.spop(RedisKeys.EntriesToBeAddedSet, batchSize, (err, reply: string[]) => {
        if (err) {
          reject(err);
        }
        else {
          resolve(reply);
        }
      });
    });
  }

  getEntriesToBeRemovedBatch(batchSize: number): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      this.redis.spop(RedisKeys.EntriesToBeRemovedSet, batchSize, (err, reply: string[]) => {
        if (err) {
          reject(err);
        }
        else {
          resolve(reply);
        }
      });
    });
  }
}
