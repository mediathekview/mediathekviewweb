import * as Redis from 'ioredis';

import { AsyncFS } from './async-fs';
import * as Path from 'path';
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

export interface ISortedSetMember {
  member: string;
  score: number;
}

export enum AggregationMode {
  Sum,
  Min,
  Max
}

const ZDIFFSTORE_SCRIPT_PATH = Path.join(__dirname, 'redis-lua', 'zdiffstore.lua');

export class RedisService {
  private static _instance: RedisService;
  private redis: Redis.Redis;

  private definedZDIFFCommand: boolean = false;

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

  zadd(key: string, members: ISortedSetMember[]): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      let scoresAndMembers = [];

      for (let i = 0; i < members.length; i++) {
        scoresAndMembers.push(members[i].score || 0, members[i].member);
      }

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

  zrange(key: string, start: number, stop: number, withScores: boolean = false): Promise<ISortedSetMember[]> {
    return new Promise<ISortedSetMember[]>((resolve, reject) => {
      let args = [key, start, stop];
      if (withScores) {
        args.push('WITHSCORES');
      }
      this.redis.zrange(...args, (error, reply) => {
        if (error) {
          reject(error);
        } else {
          let result = this.parsezrange(reply, withScores);
          resolve(result);
        }
      });
    });
  }

  zpop(key: string, withScores: boolean, count: number = 1): Promise<ISortedSetMember[]> {
    return new Promise<ISortedSetMember[]>((resolve, reject) => {
      let multi = this.redis.multi();

      let rangeArgs = [key, 0, count];
      if (withScores) {
        rangeArgs.push('WITHSCORES');
      }

      multi
        .zrange(...rangeArgs)
        .zremrangebyrank(key, 0, count)
        .exec((error, reply) => {
          if (error) {
            reject(error);
          } else {
            let result = this.parsezrange(reply[0][1], withScores);
            resolve(result);
          }
        });
    });
  }

  parsezrange(reply: any, withScores: boolean): ISortedSetMember[] {
    let result: ISortedSetMember[] = [];

    if (withScores) {
      for (let i = 0; i < reply.length; i += 2) {
        result.push({ member: reply[i], score: reply[i + 1] });
      }
    } else {
      for (let i = 0; i < reply.length; i++) {
        result.push({ member: reply[i], score: null });
      }
    }

    return result;
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

  createSortedSetOperationArgs(destination: string, keys: string[], options?: { weights?: number[], aggregationMode?: AggregationMode }): (string | number)[] {
    let args = [destination, keys.length, ...keys];

    if (options && options.weights) {
      args.push('WEIGHTS', ...options.weights);
    }
    if (options && options.aggregationMode != undefined && options.aggregationMode != null) {
      args.push('AGGREGATE');

      let mode;
      switch (options.aggregationMode) {
        case AggregationMode.Sum:
          mode = 'SUM';
          break;
        case AggregationMode.Min:
          mode = 'MIN';
          break;
        case AggregationMode.Max:
          mode = 'MAX';
          break;
      }

      args.push(mode);
    }

    return args;
  }

  zinterstore(destination: string, keys: string[], options?: { weights?: number[], aggregationMode?: AggregationMode }): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      let args = this.createSortedSetOperationArgs(destination, keys, options);

      this.redis.zinterstore(...args, (error, reply) => {
        if (error) {
          reject(error);
        } else {
          resolve(reply);
        }
      });
    });
  }

  zunionstore(destination: string, keys: string[], options?: { weights?: number[], aggregationMode?: AggregationMode }): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      let args = this.createSortedSetOperationArgs(destination, keys, options);

      this.redis.zunionstore(...args, (error, reply) => {
        if (error) {
          reject(error);
        } else {
          resolve(reply);
        }
      });
    });
  }

  zdiffstore(destination: string, keys: string[]): Promise<number> {
    return new Promise<number>(async (resolve, reject) => {
      if (!this.definedZDIFFCommand) {
        let script = await AsyncFS.readFile(ZDIFFSTORE_SCRIPT_PATH);

        this.redis.defineCommand('zdiffstore', {
          lua: script
        });

        this.definedZDIFFCommand = true;
      }

      let args = [keys.length + 1, destination, ...keys];

      (this.redis as any).zdiffstore(...args, (error, reply) => {
        if (error) {
          reject(error);
        } else {
          resolve(reply);
        }
      });
    });
  }

  zscore(key: string, member: string): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      this.redis.zscore(key, member, (error, reply) => {
        if (error) {
          reject(error);
        } else {
          resolve(reply);
        }
      });
    });
  }

  zrem(key: string, ...members: string[]): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      this.redis.zrem(key, ...members, (error, reply) => {
        if (error) {
          reject(error);
        } else {
          resolve(reply);
        }
      });
    });
  }

  zcard(key: string): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      this.redis.zcard(key, (error, reply) => {
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
          resolve(reply);
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
          resolve(reply);
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
          resolve(reply);
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
          resolve(reply);
        }
      });
    });
  }
}
