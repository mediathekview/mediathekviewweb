import * as Redis from 'ioredis';
import { ISearchEngineBackend, IState, State, IndexItem } from '../backend';
import * as Queries from './query';
import { IRedisSerializer, IntSerializer, BooleanSerializer } from './serialization';
import { Utils } from './utils';

export type Serialization = { [key: string]: IRedisSerializer<any, string> };

const USED_MEMORY_REGEX = /^used_memory:(\d+)$/m;

export class RedisBackend<T> implements ISearchEngineBackend<T> {
  redis: Redis.Redis;
  serialization: { [key: string]: IRedisSerializer<any, string> };

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
          let serializedValues = [];

          for (let k = 0; k < values.length; k++) {
            serializedValues[k] = serializer.serialize(values[k]);
          }
        }

        for (let k = 0; k < values.length; k++) {
          let value = values[k];
          let setKey = indexValue.property + ':' + value;

          multi.zadd('rangeIndex:' + indexValue.property, 0, value);
          multi.sadd('valueIndex:', setKey, item.id);
        }
      }

      if (item.rawItem != undefined) {
        let keyValueArray = Utils.objectToKeyJSONValueArray(item.rawItem);

        multi.hmset('rawItem:' + item.id, ...keyValueArray);
      }
    }

    await multi.exec();
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
