import { QueryBody } from '../';

export abstract class QueryBuilder {
  abstract build(): QueryBody;
}
