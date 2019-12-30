import { Enumerable } from '@tstdl/base/enumerable';
import { QueryBody, SearchQuery, Sort } from '../definition';
import { QueryBuilder } from './builder';
import { SortBuilder } from './sort';

export class SearchQueryBuilder {
  private _body: QueryBody | undefined;
  private _sort: Sort[]; // tslint:disable-line: prefer-readonly
  private _skip: number | undefined;
  private _limit: number | undefined;
  private _cursor: string | undefined;

  constructor() {
    this._sort = [];
  }

  body(body: QueryBody | QueryBuilder): this {
    this._body = (body instanceof QueryBuilder) ? body.build() : body;
    return this;
  }

  sort(...sort: (Sort | SortBuilder)[]): this {
    const mapped = Enumerable.from(sort)
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

  cursor(value: string): this {
    this._cursor = value;
    return this;
  }

  build(): SearchQuery {
    if (this._body == undefined) {
      throw new Error('body not set');
    }

    const query: SearchQuery = {
      body: this._body
    };

    if (this._sort.length > 0) {
      query.sort = this._sort;
    }

    if (this._skip != undefined) {
      query.skip = this._skip;
    }

    if (this._limit != undefined) {
      query.limit = this._limit;
    }

    if (this._cursor != undefined) {
      query.cursor = this._cursor;
    }

    return query;
  }
}
