import * as Redis from 'redis';

class Keys {
  static TimestampHistoryList = 'filmliste:timestampHistory';
}

class _RedisService {
  private redis: Redis.RedisClient;

  constructor() {

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
}

export const RedisService = new _RedisService();
