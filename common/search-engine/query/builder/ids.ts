import { IDsQuery } from '../definition';
import { QueryBuilder } from './builder';

export class IDsQueryBuilder extends QueryBuilder {
  private readonly _ids: string[];

  constructor() {
    super();

    this._ids = [];
  }

  add(...ids: string[]): IDsQueryBuilder {
    this._ids.push(...ids);

    return this;
  }

  build(): IDsQuery {
    return { ids: this._ids };
  }
}
