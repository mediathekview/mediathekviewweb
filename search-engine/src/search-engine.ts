import { ISearchEngineBackend, IndexValue, IndexItem, State } from './backend';
import { IMapper } from './mapping';
import * as Queries from './query';

export type Mapping = { [key: string]: IMapper<any> };

export class SearchEngine<T> {
  backend: ISearchEngineBackend<T>;
  mapping: Mapping;
  keys: string[];

  constructor(backend: ISearchEngineBackend<T>, mapping: Mapping) {
    this.backend = backend;
    this.mapping = mapping;
    this.keys = Object.getOwnPropertyNames(this.mapping);
  }

  index(items: T[], ids: string[]): Promise<void> {
    let object: { [key: string]: any } = {};
    let indexItems: IndexItem<T>[] = [];

    for (let i = 0; i < items.length; i++) {
      let indexValues: IndexValue<any>[] = [];
      for (let j = 0; j < this.keys.length; j++) {
        let indexValue: IndexValue<any> = { property: this.keys[i], values: [] };
        indexValue.values = this.mapping[this.keys[j]].map(items[i]);

        indexValues.push(indexValue);
      }

      indexItems.push({ rawItem: items[i], indexValues: indexValues, id: ids[i] })
    }

    return this.backend.index(indexItems);
  }

  state(): Promise<State> {
    return this.backend.state();
  }

  getWordQuery(): Queries.IWordQuery<T> {
    return this.backend.getWordQuery();
  }

  getTextQuery(): Queries.ITextQuery<T> {
    return this.backend.getTextQuery();
  }

  getRangeQuery(): Queries.IRangeQuery<T> {
    return this.backend.getRangeQuery();
  }

  getAndQuery(): Queries.IAndQuery<T> {
    return this.backend.getAndQuery();
  }

  getOrQuery(): Queries.IOrQuery<T> {
    return this.backend.getOrQuery();
  }
}
