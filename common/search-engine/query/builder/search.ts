import { SyncEnumerable } from '../../../enumerable';
import { QueryBody, SearchQuery, Sort } from '../definition';
import { QueryBuilder } from './builder';
import { SortBuilder } from './sort';

export class SearchQueryBuilder {
  private _body: QueryBody | null;
  private _sort: Sort[];
  private _skip: number | null;
  private _limit: number | null;

  constructor() {
    this._body = null;
    this._sort = [];
    this._skip = null;
    this._limit = null;
  }

  body(body: QueryBody | QueryBuilder): this {
    this._body = (body instanceof QueryBuilder) ? body.build() : body;
    return this;
  }

  sort(...sort: (Sort | SortBuilder)[]): this {
    const mapped = SyncEnumerable.from(sort)
      .mapMany((sortOrBuilder) => (sortOrBuilder instanceof SortBuilder) ? sortOrBuilder.build() : [sortOrBuilder])
      .toArray();

    this._sort.push(...mapped);

    return this;
  }

  skip(skip: number): this {
    this._skip = skip;
    return this;
  }

  limit(limit: number): this {
    this._limit = limit;
    return this;
  }

  build(): SearchQuery {
    if (this._body == null) {
      throw new Error('body not set');
    }

    const query: SearchQuery = {
      body: this._body
    };

    if (this._sort.length > 0) {
      query.sort = this._sort;
    }

    if (this._skip != null) {
      query.skip = this._skip;
    }

    if (this._limit != null) {
      query.limit = this._limit;
    }

    return query;
  }
}
