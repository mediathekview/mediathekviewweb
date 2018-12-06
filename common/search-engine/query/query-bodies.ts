import { BoolQuery, IDsQuery, MatchAllQuery, RangeQuery, RegexQuery, TermQuery, TextQuery } from './definition';

export type IDsQueryBody = TypeOf<IDsQuery, 'ids'>;
export type TermQueryBody = PropertyOf<TermQuery, 'term'>;
export type MatchAllQueryBody = PropertyOf<MatchAllQuery, 'matchAll'>;
export type BoolQueryBody = PropertyOf<BoolQuery, 'bool'>;
export type RangeQueryBody = PropertyOf<RangeQuery, 'range'>;
export type TextQueryBody = PropertyOf<TextQuery, 'text'>;
export type RegexQueryBody = PropertyOf<RegexQuery, 'regex'>;
