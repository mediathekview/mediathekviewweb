// tslint:disable: no-redundant-jsdoc
import { Field } from '../../model';

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
  field: Field;
  order: Order;
  aggregation?: Aggregation;
};

/** @minProperties 1 */
export type QueryBody = Partial<TermQuery & IDsQuery & MatchAllQuery & BoolQuery & RangeQuery & TextQuery & RegexQuery>;

export type SearchQuery = {
  body: QueryBody;
  sort?: Sort[];
  /** @type integer */
  skip?: number;
  /** @type integer */
  limit?: number;
};

export type TermQueryValue = string | number | boolean;

export type TermQuery = {
  term: {
    field: Field;
    value: TermQueryValue;
  }
};

export type IDsQuery = {
  /** @minItems 1 */
  ids: string[];
};

export type MatchAllQuery = {
  matchAll: {}
};

/**
 * @minProperties 1
 */
export type BoolQuery = {
  /** @minProperties 1 */
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
  /** @minProperties 2 */
  range: {
    field: Field;
    lt?: RangeQueryValue;
    lte?: RangeQueryValue;
    gt?: RangeQueryValue;
    gte?: RangeQueryValue;
  }
};

export type TextQuery = {
  text: {
    /** @minItems 1 */
    fields: Field[];
    text: string;
    operator: Operator;
  }
};

export type RegexQuery = {
  regex: {
    field: Field;
    expression: string;
  }
};
