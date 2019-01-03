import { PropertyValidationError, PropertyValidationFunction, PropertyValidationResult } from './validator';

export type ValidationTypes = 'string' | 'number' | 'boolean' | 'null' | 'undefined' | 'date' | 'array';

export const NULL_OR_UNDEFINED_ERROR: PropertyValidationError = Object.freeze({
  message: 'value is null or undefined'
});

export function validateValue<T>(value: T, allowedValues: T[]): PropertyValidationResult {
  let result: PropertyValidationResult = null;

  const isValid = allowedValues.some((allowedValue) => (value === allowedValue));

  if (!isValid) {
    const allowedValuesString = stringListing('and', allowedValues);

    result = {
      message: 'invalid value',
      hint: `valid values are ${allowedValuesString}`
    };
  }

  return result;
}

export function validateArray(value: unknown, validator: PropertyValidationFunction): PropertyValidationResult {
  const arrayValidation = validateType(value, 'array');

  if (arrayValidation != null) {
    return arrayValidation;
  }

  const validationErrors = (value as unknown[])
    .map((value, index) => ({ result: validator(value), index }))
    .filter(({ result }) => result != null);

  if (validationErrors.length > 0) {
    const errors: NumberMap<PropertyValidationResult> = {};

    validationErrors.forEach(({ result, index }) => errors[index] = result);
    return errors;
  }

  return null;
}

export function validateString(value: unknown): PropertyValidationResult {
  return validateType(value, 'string');
}

export function validateType(value: unknown, ...types: ValidationTypes[]): PropertyValidationResult {
  const typeValidators: StringMap<(value: unknown) => boolean> = {
    'string': (value: unknown) => (typeof value == 'string'),
    'number': (value: unknown) => (typeof value == 'number'),
    'boolean': (value: unknown) => (typeof value == 'boolean'),
    'null': (value: unknown) => (value == null),
    'undefined': (value: unknown) => (value == undefined),
    'date': (value: unknown) => (value instanceof Date),
    'array': (value: unknown) => Array.isArray(value)
  };

  const invalidTypes = types.filter((type) => !(type in typeValidators));

  if (invalidTypes.length > 0) {
    const invalidTypesString = stringListing('and', invalidTypes);
    throw new Error(`invalid types specified: ${invalidTypesString}`);
  }

  const hasValidType = types.some((type) => typeValidators[type](value));

  if (!hasValidType) {
    const allowedTypesString = stringListing('or', types);

    const error: PropertyValidationError = {
      message: `invalid type ${typeof value}`,
      hint: `value must be of type ${allowedTypesString}`
    };

    return error;
  }

  return null;
}

export function nullOrUndefined<T>(value: T | null | undefined): PropertyValidationResult;
export function nullOrUndefined<T>(value: T | null | undefined, ifNotThen: (value: T) => PropertyValidationResult): PropertyValidationResult;
export function nullOrUndefined<T>(value: T | null | undefined, ifNotThen?: (value: T) => PropertyValidationResult): PropertyValidationResult {
  if ((value == undefined) || (value == null)) {
    return NULL_OR_UNDEFINED_ERROR;
  }

  if (ifNotThen != undefined) {
    return ifNotThen(value);
  }

  return null;
}

function stringListing(joinWord: string, values: any[]) {
  if (values.length == 0) {
    throw new Error('no values supplied');
  }

  if (values.length > 0) {
    return values[0];
  }

  const allButLast = values.slice(0, -1).join(', ');
  const last = values[values.length - 1];
  const listing = `${allButLast} ${joinWord} ${last}`;

  return listing;
}
