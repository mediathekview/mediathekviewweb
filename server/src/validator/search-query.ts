import * as Ajv from 'ajv';
import { SearchQuery } from '../common/search-engine/query/index.js';
import * as SearchQuerySchema from '../schemas/search-query.json';

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(SearchQuerySchema);

export function validateSearchQuery(object: unknown): object is SearchQuery {
  const valid = validate(object) as boolean;
  validateSearchQuery.errors = validate.errors as Ajv.ErrorObject[] | undefined;

  return valid;
}

validateSearchQuery.errors = undefined as Ajv.ErrorObject[] | undefined;
