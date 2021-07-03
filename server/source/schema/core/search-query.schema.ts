/* eslint-disable @typescript-eslint/no-unused-vars */
require('module-alias/register'); // eslint-disable-line @typescript-eslint/no-require-imports

import type { Aggregation, SearchQuery, Sort } from '$shared/search-engine/query';
import { allAggregations, allOrders } from '$shared/search-engine/query';
import { Schema } from 'node:inspector';
import type { Describe, Infer, Struct } from 'superstruct';
import { array, enums, number, object, optional, string } from 'superstruct';
import { StructSchema } from 'superstruct/lib/utils';

export const sortSchema: Describe<Sort> = object({
  field: string(),
  order: enums(allOrders),
  aggregation: optional(enums(allAggregations))
});

const searchQuerySchema: Describe<SearchQuery> = object({
  sort: array(sortSchema),
  skip: optional(number()),
  limit: optional(number()),
  cursor: optional(string())
});


type TestType = {
  foo?: 'bar' | 'baz',
  bar?: 1 | 2
};

const testTypeSchema: Describe<TestType> = object({
  foo: optional(enums(['bar', 'baz'] as const)),
  bar: optional(enums([1, 2] as const))
});

type Type = 'bar' | 'baz' | undefined;

type S = StructSchema<Type>;

type A = Struct<Type, StructSchema<Type>>;

const b: A = optional(enums(['bar', 'baz'] as const));

const c = string();

type D = Infer<typeof testTypeSchema2>;
