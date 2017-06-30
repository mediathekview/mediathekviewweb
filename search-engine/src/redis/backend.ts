import * as Redis from 'ioredis';
import { ISearchEngineBackend, IState, State, IndexItem, UpdateItem } from '../backend';
import { IComperator } from '../comperator';
import * as Queries from './query';
import { IRedisSerializer, IntSerializer, BooleanSerializer } from './serialization';
import { Utils } from './utils';

export type Serialization = { [key: string]: IRedisSerializer<any, string> };

const USED_MEMORY_REGEX = /^used_memory:(\d+)$/m;

export class RedisBackend<T> implements ISearchEngineBackend<T> {
  private redis: Redis.Redis;
  private serialization: { [key: string]: IRedisSerializer<any, string> };

  constructor(redis: Redis.Redis, serialization?: Serialization) {
    this.redis = redis;
    this.serialization = serialization ? serialization : {};
  }

  async index(items: IndexItem<T>[]): Promise<void> {
    let multi = this.redis.multi();

    for (let i = 0; i < items.length; i++) {
      let item = items[i];

      for (let j = 0; j < item.indexValues.length; j++) {
        let indexValue = item.indexValues[j];
        let values = indexValue.values;

        let serializer = this.serialization[indexValue.property];
        if (serializer != undefined) {
          for (let k = 0; k < values.length; k++) {
            values[k] = serializer.serialize(values[k]);
          }
        }

        for (let k = 0; k < values.length; k++) {
          let value = values[k];
          let setKey = indexValue.property + ':' + value;

          multi.zadd('range:' + indexValue.property, 0, value);
          multi.sadd('value:' + setKey, item.id);
          multi.sadd('tokens:' + item.id + ':' + indexValue.property, ...values);
        }
      }

      if (item.rawItem != undefined) {
        let keyValueArray = Utils.objectToKeyJSONValueArray(item.rawItem);

        multi.hmset('raw:' + item.id, ...keyValueArray);
      }
    }

    await multi.exec();
  }

  async update(items: UpdateItem<T>[]): Promise<void> {

  }

  async delete(ids: string[]): Promise<void> {

  }

  state(): Promise<IState> {
    return new Promise<State>(async (resolve, reject) => {
      let memoryInfo = await this.redis.info('memory');
      console.log(memoryInfo);
    });
  }

  getWordQuery(): Queries.RedisWordQuery<T> {
    return;
  }

  getTextQuery(): Queries.RedisTextQuery<T> {
    return;
  }

  getRangeQuery(): Queries.RedisRangeQuery<T> {
    return;
  }

  getAndQuery(): Queries.RedisAndQuery<T> {
    return;
  }

  getOrQuery(): Queries.RedisOrQuery<T> {
    return;
  }
}
