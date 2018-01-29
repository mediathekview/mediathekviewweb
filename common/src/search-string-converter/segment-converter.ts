import { Segment } from './segment';
import { QueryBody } from '../search-engine/query';

export type SegmentConverterResult = { include?: QueryBody, exclude?: QueryBody }

export interface SegmentConverter {
  canHandle(segment: Segment): boolean;
  convert(segment: Segment): SegmentConverterResult;
}
