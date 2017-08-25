import { IQueryBuilder } from './';
import { IIDsQuery } from '../';

export class IDsQueryBuilder implements IQueryBuilder {
  private _ids: string[];

  add(...ids: string[]): IDsQueryBuilder {
    this._ids.push(...ids);

    return this;
  }

  build(): IIDsQuery {
    return { ids: this._ids };
  }
}
