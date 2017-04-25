import * as Redis from 'redis';

import { Entry } from './model';

class Keys {
  static TimestampHistoryList = 'filmliste:timestampHistory';
  static EntriesToBeAddedSet = 'entries:toBeAdded';
  static EntriesToBeRemovedSet = 'entries:toBeRemoved';
}

export class RedisService {
  private static _instance: RedisService;

  private redis: Redis.RedisClient;

  private constructor() {
    this.redis = Redis.createClient();
  }

  static getInstance(): RedisService {
    if (this._instance == undefined) {
      this._instance = new RedisService();
    }

    return this._instance;
  }

  getCurrentFilmlisteTimestamp(): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      this.redis.lrange(Keys.TimestampHistoryList, -1, -1, (err, reply: number[]) => {
        if (err) {
          reject(err);
        }
        else {
          if (reply.length == 0) {
            resolve(-1);
          }
          else {
            resolve(reply[0]);
          }
        }
      });
    });
  }

  pushNewFilmlisteTimestamp(timestamp: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.redis.rpush(Keys.TimestampHistoryList, timestamp, (err, reply: number[]) => {
        if (err) {
          reject(err);
        }
        else {
          resolve();
        }
      });
    });
  }

  getEntriesToBeAddedBatch(batchSize: number): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      this.redis.spop(Keys.EntriesToBeAddedSet, batchSize, (err, reply: string[]) => {
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
      this.redis.spop(Keys.EntriesToBeRemovedSet, batchSize, (err, reply: string[]) => {
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
