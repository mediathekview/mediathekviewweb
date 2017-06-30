import * as Queries from './query';
import * as Comperator from './comperator';

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

export type IndexValue<T> = { property: string; values: T[]; }
export type UpdateCondition = { property: string, comperator: Comperator.IComperator, values: any[] };

export type IndexItem<T> = { id: string, rawItem?: T, indexValues: IndexValue<any>[] };
export type UpdateItem<T> = { id: string, updateObject?: object, indexValues: IndexValue<any>[], condition?: UpdateCondition, upsert?: boolean };

export interface ISearchEngineBackend<T> {
  index(items: IndexItem<T>[]): Promise<void>;
  update(items: UpdateItem<T>[]): Promise<void>;
  delete(ids: string[]): Promise<void>;
  state(): Promise<State>;

  getWordQuery(): Queries.IWordQuery<T>;
  getTextQuery(): Queries.ITextQuery<T>;
  getRangeQuery(): Queries.IRangeQuery<T>;
  getAndQuery(): Queries.IAndQuery<T>;
  getOrQuery(): Queries.IOrQuery<T>;
}
