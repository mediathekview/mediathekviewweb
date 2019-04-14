import { PropertyOf, TypeOf } from '@common-ts/base/types';
import { BoolQuery, IdsQuery, MatchAllQuery, RangeQuery, RegexQuery, TermQuery, TextQuery } from './definition';

export type IdsQueryBody = TypeOf<IdsQuery, 'ids'>;
export type TermQueryBody = PropertyOf<TermQuery, 'term'>;
export type MatchAllQueryBody = PropertyOf<MatchAllQuery, 'matchAll'>;
export type BoolQueryBody = PropertyOf<BoolQuery, 'bool'>;
export type RangeQueryBody = PropertyOf<RangeQuery, 'range'>;
export type TextQueryBody = PropertyOf<TextQuery, 'text'>;
export type RegexQueryBody = PropertyOf<RegexQuery, 'regex'>;
