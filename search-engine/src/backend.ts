import * as Queries from './query';

export interface IState {
  indexedItems: number;
  lastChange: number;
  memoryUsage: number;
}

export class State implements State {
  indexedItems: number;
  lastChange: number;
  memoryUsage: number;

  constructor(indexedItems: number, lastChange: number, memoryUsage: number) {
    this.indexedItems = indexedItems;
    this.lastChange = lastChange;
    this.memoryUsage = memoryUsage;
  }
}

export type IndexValue<T> = {
  property: string;
  values: T[];
}

export type IndexItem<T> = { indexValues: IndexValue<any>[], id: string, rawItem?: T };

export interface ISearchEngineBackend<T> {
  index(items: IndexItem<T>[]): Promise<void>;
  state(): Promise<State>;

  getWordQuery(): Queries.IWordQuery<T>;
  getTextQuery(): Queries.ITextQuery<T>;
  getRangeQuery(): Queries.IRangeQuery<T>;
  getAndQuery(): Queries.IAndQuery<T>;
  getOrQuery(): Queries.IOrQuery<T>;
}
