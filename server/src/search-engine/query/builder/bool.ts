import { IQueryBuilder } from './';
import { IQuery, IBoolQuery } from '../';

export class BoolQueryBuilder implements IQueryBuilder {
  private musts: IQueryBuilder[] = [];
  private shoulds: IQueryBuilder[] = [];
  private nots: IQueryBuilder[] = [];
  private filters: IQueryBuilder[] = [];

  build(): IBoolQuery {
    const queryObj: IBoolQuery = {
      bool: {}
    };

    if (this.musts.length > 0) {
      queryObj.bool.musts = this.musts.map((queryBuilder) => queryBuilder.build());
    }
    if (this.shoulds.length > 0) {
      queryObj.bool.shoulds = this.shoulds.map((queryBuilder) => queryBuilder.build());
    }
    if (this.nots.length > 0) {
      queryObj.bool.nots = this.nots.map((queryBuilder) => queryBuilder.build());
    }
    if (this.filters.length > 0) {
      queryObj.bool.filters = this.filters.map((queryBuilder) => queryBuilder.build());
    }

    return queryObj;
  }

  must(...queries: IQueryBuilder[]): BoolQueryBuilder {
    this.musts.push(...queries);

    return this;
  }

  should(...queries: IQueryBuilder[]): BoolQueryBuilder {
    this.shoulds.push(...queries);

    return this;
  }

  not(...queries: IQueryBuilder[]): BoolQueryBuilder {
    this.nots.push(...queries);

    return this;
  }

  filter(...queries: IQueryBuilder[]): BoolQueryBuilder {
    this.filters.push(...queries);

    return this;
  }
}
