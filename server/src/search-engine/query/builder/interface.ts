import { IQuery } from '../';

export interface IQueryBuilder {
  build(): IQuery;
}
