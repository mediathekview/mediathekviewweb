export type Aggregation = 'min' | 'max' | 'sum' | 'average' | 'median' | 'length';

export type Order = 'ascending' | 'descending';

export type Operator = 'and' | 'or';

export type Sort = {
  field: string;
  order: Order;
  aggregation?: Aggregation;
}

export type Query = {
  body: IIDsQuery | IMatchAllQuery | IBoolQuery | IRangeQuery | ITextQuery;
  sorts?: Sort[];
  skip?: number;
  limit?: number;
}

export interface IQuery {
}

export interface IIDsQuery extends IQuery {
  ids: string[];
}

export interface IMatchAllQuery extends IQuery {
  matchAll: {}
}

export interface IBoolQuery extends IQuery {
  bool: {
    must?: IQuery[],
    should?: IQuery[],
    not?: IQuery[],
    filter?: IQuery[]
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

export interface IRegexQuery extends IQuery {
  regex: {
    field: string;
    expression: string;
  }
}
