import { ErrorObject } from 'ajv';

export type ValidationResult = { valid: true, error: undefined } | { valid: false, error: ValidationError };
export type ValidationError = ErrorObject[];

export type ValidationFunction = (object: unknown) => ValidationResult;
