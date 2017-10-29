import { Segment } from '../definitions';
import { IQueryBuilder, Operator, RegexQueryBuilder, TextQueryBuilder } from '../../search-engine';
import { Field } from '../../model';

export interface SegmentConverter {
  canHandle(segment: Segment): boolean;
  convert(segment: Segment): IQueryBuilder;
}
