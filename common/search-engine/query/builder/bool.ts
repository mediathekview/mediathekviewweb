import { BoolQuery, QueryBody } from '../definition';
import { QueryBuilder } from './builder';

export class BoolQueryBuilder extends QueryBuilder {
  private readonly _must: (QueryBuilder | QueryBody)[];
  private readonly _should: (QueryBuilder | QueryBody)[];
  private readonly _not: (QueryBuilder | QueryBody)[];
  private readonly _filter: (QueryBuilder | QueryBody)[];

  constructor() {
    super();

    this._must = [];
    this._should = [];
    this._not = [];
    this._filter = [];
  }

  build(): BoolQuery {
    const queryObj: BoolQuery = {
      bool: {}
    };

    if (this._must.length > 0) {
      queryObj.bool.must = this._must.map((q) => (q instanceof QueryBuilder ? q.build() : q));
    }
    if (this._should.length > 0) {
      queryObj.bool.should = this._should.map((q) => (q instanceof QueryBuilder ? q.build() : q));
    }
    if (this._not.length > 0) {
      queryObj.bool.not = this._not.map((q) => (q instanceof QueryBuilder ? q.build() : q));
    }
    if (this._filter.length > 0) {
      queryObj.bool.filter = this._filter.map((q) => (q instanceof QueryBuilder ? q.build() : q));
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
