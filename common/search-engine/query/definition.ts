export const enum Aggregation {
  'Min' = 'min',
  'Max' = 'max',
  'Sum' = 'sum',
  'Average' = 'average',
  'Median' = 'median',
  'Length' = 'length'
};

export const enum Order {
  Ascending = 'ascending',
  Descending = 'descending'
};

export const enum Operator {
  And = 'and',
  Or = 'or'
};

export type Sort = {
  field: string;
  order: Order;
  aggregation?: Aggregation;
}

export type QueryBody = Partial<TermQuery & IDsQuery & MatchAllQuery & BoolQuery & RangeQuery & TextQuery & RegexQuery>;

export type SearchQuery = {
  body: QueryBody;
  sort?: Sort[];
  skip?: number;
  limit?: number;
}

export type TermQueryValue = string | number | boolean | Date;

export type TermQuery = {
  term: {
    field: string;
    value: TermQueryValue;
  }
}

export type IDsQuery = {
  ids: string[];
}

export type MatchAllQuery = {
  matchAll: {}
}

export type BoolQuery = {
  bool: {
    must?: QueryBody[],
    should?: QueryBody[],
    not?: QueryBody[],
    filter?: QueryBody[]
  }
}

export type RangeQuery = {
  range: {
    field: string;
    lt?: number | string | Date;
    lte?: number | string | Date;
    gt?: number | string | Date;
    gte?: number | string | Date;
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
    field: string;
    expression: string;
  }
}
