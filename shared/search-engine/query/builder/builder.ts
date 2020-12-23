import { QueryBody } from '../definition';

export abstract class QueryBuilder {
  abstract build(): QueryBody;
}
