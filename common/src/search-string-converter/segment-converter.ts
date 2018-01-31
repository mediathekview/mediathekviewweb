import { Segment } from './segment';
import { QueryBody } from '../search-engine/query';

export type SegmentConverterResult = { include?: QueryBody, exclude?: QueryBody }

export interface SegmentConverter {
  tryConvert(segment: Segment): SegmentConverterResult | null;
}
