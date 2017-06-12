import * as Queries from './query';

export interface State {
  indexedItems: number;
  lastChange: number;
}

export interface IToken<T> {
  sourceProperty: string;
  value: T;
}

export type IndexParameter<T> = { tokens: IToken<any>, item?: T, id?: string };

export interface ISearchEngineBackend<T> {
  index(data: IndexParameter<T>[]): Promise<string[]>;
  state(): Promise<State>;

  getWordQuery(): Queries.IWordQuery<T>;
  getTextQuery(): Queries.ITextQuery<T>;
  getRangeQuery(): Queries.IRangeQuery<T>;
  getAndQuery(): Queries.IAndQuery<T>;
  getOrQuery(): Queries.IOrQuery<T>;
}
