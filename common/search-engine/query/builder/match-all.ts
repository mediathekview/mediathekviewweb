import { MatchAllQuery } from '../definition';
import { QueryBuilder } from './builder';

export class MatchAllQueryBuilder extends QueryBuilder {
  build(): MatchAllQuery {
    return {
      matchAll: {}
    };
  }
}
