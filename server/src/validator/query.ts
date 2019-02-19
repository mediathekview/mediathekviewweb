import * as Ajv from 'ajv';
import { SearchQuery, TextSearchQuery } from '../common/search-engine/query/index.js';
import { SearchQuerySchema, TextSearchQuerySchema } from '../schemas/index.js';

export type ValidationFunctionErrors = Ajv.ErrorObject[] | undefined | null;

export type ValidationFunction<T> = {
  (object: unknown): object is T;
  errors: ValidationFunctionErrors;
};

const ajv = new Ajv({ allErrors: true });
const _validateSearchQuery = ajv.compile(SearchQuerySchema);
const _validateTextSearchQuery = ajv.compile(TextSearchQuerySchema);

export function validateSearchQuery(object: unknown): object is SearchQuery {
  const valid = _validateSearchQuery(object) as boolean;
  validateSearchQuery.errors = _validateSearchQuery.errors;

  return valid;
}

export function validateTextSearchQuery(object: unknown): object is TextSearchQuery {
  const valid = _validateTextSearchQuery(object) as boolean;
  validateTextSearchQuery.errors = _validateTextSearchQuery.errors;

  return valid;
}

validateSearchQuery.errors = undefined as ValidationFunctionErrors;
validateTextSearchQuery.errors = undefined as ValidationFunctionErrors;
