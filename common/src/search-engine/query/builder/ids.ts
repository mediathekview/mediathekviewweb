import { QueryBuilder } from './base';
import { IDsQuery } from '../';

export class IDsQueryBuilder extends QueryBuilder {
  private _ids: string[];

  add(...ids: string[]): IDsQueryBuilder {
    this._ids.push(...ids);

    return this;
  }

  build(): IDsQuery {
    return { ids: this._ids };
  }
}
