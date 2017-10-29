import { Query } from '../';

export abstract class QueryBuilder {
  abstract build(): Query;
}
