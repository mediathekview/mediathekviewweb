import { QueryResponse, QueryOptions } from './model';


export interface IQuery<T> {
  query(options: QueryOptions): Promise<QueryResponse<T>>;
  _itemType(type: string);
}

export interface IWordQuery<T> extends IQuery<T> {
  field(key: string): IWordQuery<T>;
  set(value: string): IWordQuery<T>;
}

export enum TextQueryMode {
  And,
  Or
}

export interface ITextQuery<T> extends IQuery<T> {
  field(key: string): ITextQuery<T>;
  set(value: string): ITextQuery<T>;
  mode(mode: TextQueryMode): ITextQuery<T>;
  minMatch(percentage: number): ITextQuery<T>;
}

export interface IRangeQuery<T> extends IQuery<T> {
  field(key: string): IRangeQuery<T>;
  less(value: number): IRangeQuery<T>;
  lessOrEqual(value: number): IRangeQuery<T>;
  greater(value: number): IRangeQuery<T>;
  greaterOrEqual(value: number): IRangeQuery<T>;
  between(a: number, b: number): IRangeQuery<T>;
  exact(value: number): IRangeQuery<T>;
}

export interface IAndQuery<T> extends IQuery<T> {
  add(...queries: IQuery<T>[]): IAndQuery<T>;
}

export interface IOrQuery<T> extends IQuery<T> {
  add(...queries: IQuery<T>[]): IOrQuery<T>;
}
