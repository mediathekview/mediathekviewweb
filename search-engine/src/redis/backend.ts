import { ISearchEngineBackend, State, IndexParameter } from '../backend';
import { ISerializer, StringSerializer, IntSerializer, BooleanSerializer } from './serialization';

export type Serialization = { [key: string]: ISerializer<any> };

export class RedisBackend<T> implements ISearchEngineBackend<T> {
  serializer: Serialization;
  autoMap: boolean;

  constructor(options: { serializer?: Serialization, autoSerialize?: boolean }) {
    if (!options || !options.serializer || options.autoSerialize == undefined || options.autoSerialize == null) {
      throw new Error('Either serializer must be specified, autoSerialize be true or both');
    }

    this.serializer = options.serializer ? options.serializer : {};
    this.autoMap = !!options.autoSerialize;
  }

  index(items: IndexParameter<T>[]): Promise<string[]> {
    throw '';
  }

  state(): Promise<State> {
    throw '';
  }
}

let serialization: Serialization = {
  'duration': new IntSerializer(5),
  'title': new StringSerializer(),
  'hasHD': new BooleanSerializer()
}
