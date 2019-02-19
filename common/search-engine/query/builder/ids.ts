import { IdsQuery } from '../definition';
import { QueryBuilder } from './builder';

export class IdsQueryBuilder extends QueryBuilder {
  private readonly _ids: string[];

  constructor() {
    super();

    this._ids = [];
  }

  add(...ids: string[]): IdsQueryBuilder {
    this._ids.push(...ids);

    return this;
  }

  build(): IdsQuery {
    return { ids: this._ids };
  }
}
