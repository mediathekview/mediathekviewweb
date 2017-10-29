import { QueryBuilder } from './';
import { Query, BoolQuery } from '../';

export class BoolQueryBuilder extends QueryBuilder {
  private _must: (QueryBuilder | Query)[] = [];
  private _should: (QueryBuilder | Query)[] = [];
  private _not: (QueryBuilder | Query)[] = [];
  private _filter: (QueryBuilder | Query)[] = [];

  build(): BoolQuery {
    const queryObj: BoolQuery = {
      bool: {}
    };

    if (this._must.length > 0) {
      queryObj.bool.must = this._must.map((q) => q instanceof QueryBuilder ? q.build() : q);
    }
    if (this._should.length > 0) {
      queryObj.bool.should = this._should.map((q) => q instanceof QueryBuilder ? q.build() : q);
    }
    if (this._not.length > 0) {
      queryObj.bool.not = this._not.map((q) => q instanceof QueryBuilder ? q.build() : q);
    }
    if (this._filter.length > 0) {
      queryObj.bool.filter = this._filter.map((q) => q instanceof QueryBuilder ? q.build() : q);
    }

    return queryObj;
  }

  must(...queries: (QueryBuilder | Query)[]): BoolQueryBuilder {
    this._must.push(...queries);

    return this;
  }

  should(...queries: (QueryBuilder | Query)[]): BoolQueryBuilder {
    this._should.push(...queries);

    return this;
  }

  not(...queries: (QueryBuilder | Query)[]): BoolQueryBuilder {
    this._not.push(...queries);

    return this;
  }

  filter(...queries: (QueryBuilder | Query)[]): BoolQueryBuilder {
    this._filter.push(...queries);

    return this;
  }
}
