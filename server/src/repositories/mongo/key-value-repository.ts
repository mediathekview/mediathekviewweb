import { StringMap } from '@tstdl/base/types';
import { Collection, MongoBaseRepository } from '@tstdl/mongo';
import { KeyValueBag } from '../../models';
import { KeyValueRepository } from '../key-value-repository';

export class MongoKeyValueRepository<T extends StringMap> implements KeyValueRepository<T> {
  private readonly baseRepository: MongoBaseRepository<KeyValueBag<T>>;
  private readonly scope: string;

  constructor(collection: Collection<KeyValueBag<T>>, scope: string) {
    this.baseRepository = new MongoBaseRepository(collection);
    this.scope = scope;
  }

  async get<K extends keyof T>(key: K, defaultValue: T[K]): Promise<T> {
    const bag = await this.baseRepository.loadByFilter({ scope: this.scope }, false);

    if (bag == undefined || !bag.data.hasOwnProperty(key)) {
      return defaultValue;
    }

    return bag.data[key] as T;
  }

  async set<K extends keyof T>(key: K, value: T[K]): Promise<void> {
    const _key = `data.${key}`;
    await this.baseRepository.update({ scope: this.scope }, { $set: { [_key]: value } });
  }
}
