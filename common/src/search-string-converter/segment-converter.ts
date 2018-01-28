import { Segment } from './segment';
import { QueryBody } from '../search-engine/query';

export interface SegmentConverter {
  canHandle(segment: Segment): boolean;
  convert(segment: Segment): QueryBody;
}
