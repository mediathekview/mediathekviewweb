import { QueryBody } from '../search-engine/query';
import { QueryBuilder } from '../search-engine/query/builder';
import { Segment } from './segment';

export type SegmentConverterResult = {
  must?: (QueryBody | QueryBuilder)[],
  should?: (QueryBody | QueryBuilder)[],
  not?: (QueryBody | QueryBuilder)[],
  filter?: (QueryBody | QueryBuilder)[]
};

export interface SegmentConverter {
  tryConvert(segment: Segment): SegmentConverterResult | undefined;
}
