import { QueryBody } from '../search-engine/query';
import { Segment } from './segment';

export enum SegmentConverterResultType {
  Include,
  Exclude
}

export type SegmentConverterResult = {
  fields: string[],
  type: SegmentConverterResultType,
  joinSameFieldsResults: boolean,
  query: QueryBody
};

export type SegmentConverterResultArray = SegmentConverterResult[];

export interface SegmentConverter {
  tryConvert(segment: Segment): SegmentConverterResultArray | undefined;
}
