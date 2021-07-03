import type { Segment } from './segment';

export type SegmentConverterResult = {
  group?: symbol | string,
  must?: (Query | QueryBuilder)[],
  should?: (Query | QueryBuilder)[],
  not?: (Query | QueryBuilder)[],
  filter?: (Query | QueryBuilder)[]
};

export interface SegmentConverter {
  tryConvert(segment: Segment): SegmentConverterResult | undefined;
}
