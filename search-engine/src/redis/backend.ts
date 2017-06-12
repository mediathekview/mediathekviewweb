import { ISearchEngineBackend, State, IndexParameter } from '../backend';
import { RedisSerializerBase, IntSerializer, BooleanSerializer } from './serialization';

export type Serialization = { [key: string]: RedisSerializerBase };

export class RedisBackend<T> implements ISearchEngineBackend<T> {
  serialization: Object;

  constructor(serialization?: Serialization) {
    this.serialization = serialization ? serialization : {};
  }

  index(data: IndexParameter<T>): Promise<string[]> {
    if (this.serialization.hasOwnProperty(data.))
    throw '';
  }

  state(): Promise<State> {
    throw '';
  }
}
