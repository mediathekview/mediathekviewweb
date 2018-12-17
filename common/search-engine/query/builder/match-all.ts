import { MatchAllQuery } from '../definition';
import { QueryBuilder } from './builder';

export const MATCH_ALL_QUERY: MatchAllQuery = {
  matchAll: {}
};

export class MatchAllQueryBuilder extends QueryBuilder {
  build(): MatchAllQuery {
    return MATCH_ALL_QUERY;
  }
}
