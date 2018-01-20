import { QueryBuilder } from './builder';
import { MatchAllQuery } from '../';

export const MATCH_ALL_QUERY: MatchAllQuery = { matchAll: {} };

export class MatchAllQueryBuilder extends QueryBuilder {
  build(): MatchAllQuery {
    return MATCH_ALL_QUERY;
  }
}
