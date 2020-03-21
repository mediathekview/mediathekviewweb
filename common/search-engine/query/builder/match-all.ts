import { MatchAllQuery } from '../definition';
import { QueryBuilder } from './builder';

export class MatchAllQueryBuilder extends QueryBuilder {
  // eslint-disable-next-line class-methods-use-this
  build(): MatchAllQuery {
    return {
      matchAll: {}
    };
  }
}
