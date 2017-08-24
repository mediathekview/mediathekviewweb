export enum Occurrence {
  Must = 0,
  Should = 1,
  MustNot = 2,
  Filter = 3
}

export enum Operator {
  And,
  Or
}

export enum SortOrder {
  Ascending = 0,
  Descending = 1
}

export enum SortMode {
  Sum,
  Minimum,
  Maximum,
  Average,
  Median,
  Length
}

export type Sort = {
  field: string;
  order: SortOrder;
  mode: SortMode;
}

export type Query = {
  body: IQuery;
  sorts: Sort[],
  skip: number,
  limit: number
}

export interface IQuery {
}

export interface IBoolQuery extends IQuery {
  bool: {
    musts?: IQuery[],
    shoulds?: IQuery[],
    nots?: IQuery[],
    filters?: IQuery[]
  }
}

export interface IRangeQuery extends IQuery {
  range: {
    field: string;
    lt?: number | string;
    lte?: number | string;
    gt?: number | string;
    gte?: number | string;
  }
}

export interface ITextQuery extends IQuery {
  text: {
    fields: string[];
    text: string;
    operator: 'and' | 'or';
  }
}
