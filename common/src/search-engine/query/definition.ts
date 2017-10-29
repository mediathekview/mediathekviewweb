export type Aggregation = 'min' | 'max' | 'sum' | 'average' | 'median' | 'length';

export type Order = 'ascending' | 'descending';

export type Operator = 'and' | 'or';

export type Sort = {
  field: string;
  order: Order;
  aggregation?: Aggregation;
}

export type Query = IDsQuery | MatchAllQuery | BoolQuery | RangeQuery | TextQuery | RegexQuery;

let a: IDsQuery | MatchAllQuery;

export type QueryObject = {
  body: Query;
  sorts?: Sort[];
  skip?: number;
  limit?: number;
}

export type IDsQuery = {
  ids: string[];
}

export type MatchAllQuery = {
  matchAll: {}
}

export type BoolQuery = {
  bool: {
    must?: Query[],
    should?: Query[],
    not?: Query[],
    filter?: Query[]
  }
}

export type RangeQuery = {
  range: {
    field: string;
    lt?: number | string;
    lte?: number | string;
    gt?: number | string;
    gte?: number | string;
  }
}

export type TextQuery = {
  text: {
    fields: string[];
    text: string;
    operator: 'and' | 'or';
  }
}

export type RegexQuery = {
  regex: {
    fields: string[];
    expression: string;
    operator: 'and' | 'or';
  }
}
