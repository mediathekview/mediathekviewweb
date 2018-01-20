import { QueryBuilder } from './builder';
import { QueryBody, BoolQuery } from '../';

export class BoolQueryBuilder extends QueryBuilder {
  private _must: (QueryBuilder | QueryBody)[] = [];
  private _should: (QueryBuilder | QueryBody)[] = [];
  private _not: (QueryBuilder | QueryBody)[] = [];
  private _filter: (QueryBuilder | QueryBody)[] = [];

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

  must(...queries: (QueryBuilder | QueryBody)[]): BoolQueryBuilder {
    this._must.push(...queries);

    return this;
  }

  should(...queries: (QueryBuilder | QueryBody)[]): BoolQueryBuilder {
    this._should.push(...queries);

    return this;
  }

  not(...queries: (QueryBuilder | QueryBody)[]): BoolQueryBuilder {
    this._not.push(...queries);

    return this;
  }

  filter(...queries: (QueryBuilder | QueryBody)[]): BoolQueryBuilder {
    this._filter.push(...queries);

    return this;
  }
}
