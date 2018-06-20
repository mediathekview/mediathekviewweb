import { PropertyValidationError, PropertyValidationFunction, PropertyValidationResult } from './validator';

export function validateValue<T>(value: T, allowedValues: T[]): PropertyValidationResult {
  let result: PropertyValidationResult = null;

  const isValid = allowedValues.some((allowedValue) => (value == allowedValue));

  if (!isValid) {
    const allowedValuesString = stringListing('and', allowedValues);

    result = {
      message: 'invalid value',
      hint: `valid values are ${allowedValuesString}`
    };
  }

  return result;
}

export function validateArray<T>(value: T[], validator: PropertyValidationFunction<T>): PropertyValidationResult {
  const arrayValidation = validateType(value, ['array']);

  if (arrayValidation != null) {
    return arrayValidation;
  }

  const validationErrors = value
    .map((value, index) => ({ result: validator(value), index }))
    .filter(({ result }) => result != null);

  if (validationErrors.length > 0) {
    const errors: NumberMap<PropertyValidationResult> = {};

    validationErrors.forEach(({ result, index }) => errors[index] = result);
    return errors;
  }

  return null;
}

export function validateString(value: string): PropertyValidationResult {
  return validateType(value, ['string']);
}

export function validateType(value: any, types: string[]): PropertyValidationResult {
  const typeValidators: StringMap<(value: any) => boolean> = {
    'string': (value: any) => (typeof value == 'string'),
    'number': (value: any) => (typeof value == 'number'),
    'boolean': (value: any) => (typeof value == 'boolean'),
    'null': (value: any) => (value == null),
    'undefined': (value: any) => (value == undefined),
    'date': (value: any) => (value instanceof Date),
    'array': (value: any) => Array.isArray(value)
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
    }

    return error;
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