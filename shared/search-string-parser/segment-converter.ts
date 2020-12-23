import type { QueryBody } from '$shared/search-engine/query';
import type { QueryBuilder } from '$shared/search-engine/query/builder';
import type { Segment } from './segment';

export type SegmentConverterResult = {
  group?: symbol | string,
  must?: (QueryBody | QueryBuilder)[],
  should?: (QueryBody | QueryBuilder)[],
  not?: (QueryBody | QueryBuilder)[],
  filter?: (QueryBody | QueryBuilder)[]
};

export interface SegmentConverter {
  tryConvert(segment: Segment): SegmentConverterResult | undefined;
}
