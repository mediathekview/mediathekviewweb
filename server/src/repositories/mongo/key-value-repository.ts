import { StringMap } from '@tstdl/base/types';
import { TypedIndexSpecification } from '@tstdl/mongo';
import { Collection } from 'mongodb';
import { KeyValueRepository } from '../key-value-repository';

export type KeyValueItem<T, K extends keyof T = any> = {
  scope: string,
  key: K,
  value: T[K]
};

const indexes: TypedIndexSpecification<KeyValueItem<any>>[] = [
  { key: { scope: 1, key: 1 }, unique: true }
];

export class MongoKeyValueRepository<T extends StringMap> implements KeyValueRepository<T> {
  private readonly collection: Collection<KeyValueItem<T>>;

  constructor(collection: Collection<KeyValueItem<T>>) {
    this.collection = collection;
  }

  async initialize(): Promise<void> {
    await this.collection.createIndexes(indexes);
  }

  async get<K extends keyof T, V extends T[K] = T[K]>(scope: string, key: K): Promise<V | undefined>;
  async get<K extends keyof T, V extends T[K]>(scope: string, key: K, defaultValue: V): Promise<T[K] | V>;
  async get<K extends keyof T, V extends T[K]>(scope: string, key: K, defaultValue?: V): Promise<T[K] | V | undefined> {
    const item = await this.collection.findOne({ scope, key });

    if (item == undefined) {
      return defaultValue;
    }

    return (item as KeyValueItem<T, K>).value;
  }

  async set<K extends keyof T>(scope: string, key: K, value: T[K]): Promise<void> {
    await this.collection.updateOne({ scope, key }, { $set: { value } }, { upsert: true });
  }
}
