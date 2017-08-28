import { IQueryBuilder } from './';
import { IQuery, IBoolQuery } from '../';

export class BoolQueryBuilder implements IQueryBuilder {
  private _must: IQueryBuilder[] = [];
  private _should: IQueryBuilder[] = [];
  private _not: IQueryBuilder[] = [];
  private _filter: IQueryBuilder[] = [];

  build(): IBoolQuery {
    const queryObj: IBoolQuery = {
      bool: {}
    };

    if (this._must.length > 0) {
      queryObj.bool.must = this._must.map((queryBuilder) => queryBuilder.build());
    }
    if (this._should.length > 0) {
      queryObj.bool.should = this._should.map((queryBuilder) => queryBuilder.build());
    }
    if (this._not.length > 0) {
      queryObj.bool.not = this._not.map((queryBuilder) => queryBuilder.build());
    }
    if (this._filter.length > 0) {
      queryObj.bool.filter = this._filter.map((queryBuilder) => queryBuilder.build());
    }

    return queryObj;
  }

  must(...queries: IQueryBuilder[]): BoolQueryBuilder {
    this._must.push(...queries);

    return this;
  }

  should(...queries: IQueryBuilder[]): BoolQueryBuilder {
    this._should.push(...queries);

    return this;
  }

  not(...queries: IQueryBuilder[]): BoolQueryBuilder {
    this._not.push(...queries);

    return this;
  }

  filter(...queries: IQueryBuilder[]): BoolQueryBuilder {
    this._filter.push(...queries);

    return this;
  }
}
