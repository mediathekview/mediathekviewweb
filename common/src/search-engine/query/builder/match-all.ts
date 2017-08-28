import { IQueryBuilder } from './';
import { IMatchAllQuery } from '../';

export class MatchAllQueryBuilder implements IQueryBuilder {
  build(): IMatchAllQuery {
    return { matchAll: {} };
  }
}
