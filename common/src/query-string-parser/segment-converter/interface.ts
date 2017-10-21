import { Segment } from '../definitions';
import { IQueryBuilder, Operator, RegexQueryBuilder, TextQueryBuilder } from '../../search-engine';
import { Field } from '../../model';

export interface SegmentConverter {
  selectorRegex: RegExp;
  canHandle(segment: Segment): boolean;
  convert(segment: Segment): IQueryBuilder;
}
