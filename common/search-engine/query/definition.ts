// tslint:disable: no-redundant-jsdoc
import { Field } from '../../models';

export const enum Aggregation {
  Min = 'min',
  Max = 'max',
  Sum = 'sum',
  Average = 'average',
  Median = 'median',
  Length = 'length'
}

export const enum Order {
  Ascending = 'ascending',
  Descending = 'descending'
}

export const enum Operator {
  And = 'and',
  Or = 'or'
}

export const enum DateRounding {
  Seconds = 'seconds',
  Minutes = 'minutes',
  Hours = 'hours',
  Days = 'days',
  Weeks = 'weeks',
  Months = 'months',
  Years = 'years'
}

export type Sort = {
  field: Field,
  order: Order,
  aggregation?: Aggregation
};

/** @minProperties 1 */
export type QueryBody = Partial<TermQuery & IdsQuery & MatchAllQuery & BoolQuery & RangeQuery & TextQuery & RegexQuery>;

type QueryOptions = {
  sort?: Sort[],
  skip?: number,
  limit?: number,
  cursor?: string
};

export type SearchQuery = QueryOptions & {
  body: QueryBody
};

export type TextSearchQuery = QueryOptions & {
  text: string
};

export type TermQueryValue = string | number | boolean;

export type TermQuery = {
  term: {
    field: Field,
    value: TermQueryValue
  }
};

export type IdsQuery = {
  ids: string[]
};

export type MatchAllQuery = {
  matchAll: {}
};

/**
 * @minProperties 1
 */
export type BoolQuery = {
  bool: {
    must?: QueryBody[],
    should?: QueryBody[],
    not?: QueryBody[],
    filter?: QueryBody[]
  }
};

export type RangeQueryValue = {
  value: number,
  dateRounding?: DateRounding
};

export type RangeQuery = {
  range: {
    field: Field,
    lt?: RangeQueryValue,
    lte?: RangeQueryValue,
    gt?: RangeQueryValue,
    gte?: RangeQueryValue
  }
};

export type TextQuery = {
  text: {
    fields: Field[],
    text: string,
    operator: Operator
  }
};

export type RegexQuery = {
  regex: {
    field: Field,
    expression: string
  }
};
