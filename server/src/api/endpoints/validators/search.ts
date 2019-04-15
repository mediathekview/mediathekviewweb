import { ValidationResult } from '@common-ts/server/api/validation';
import * as Ajv from 'ajv';
import { SearchParametersSchema, TextSearchParametersSchema } from './schemas';

const ajv = new Ajv({ allErrors: true });

const _validateSearchParameters = ajv.compile(SearchParametersSchema);
const _validateTextSearchParameters = ajv.compile(TextSearchParametersSchema);

export function validateSearchParameters(object: unknown): ValidationResult {
  const valid = _validateSearchParameters(object) as boolean;

  if (valid) {
    return { valid, error: undefined };
  }

  return { valid, error: _validateSearchParameters.errors };
}

export function validateTextSearchParameters(object: unknown): ValidationResult {
  const valid = _validateTextSearchParameters(object) as boolean;

  if (valid) {
    return { valid, error: undefined };
  }

  return { valid, error: _validateSearchParameters.errors };
}
