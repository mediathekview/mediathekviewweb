import '../../../extensions/set';

export type PropertyValidationError = {
  message: string,
  hint?: string
};

export type PropertyValidationResult<T> = null | PropertyValidationError | PropertyValidationError[] | ObjectValidationResult<T> | {[P in keyof T]: PropertyValidationResult<T[P]>};

export type ObjectValidationResult<T> = {
  missing?: string[],
  unknown?: string[],
  properties?: {[P in keyof T]?: PropertyValidationError | PropertyValidationError[] | ObjectValidationResult<T[P]> }
};

export type PropertyValidationFunction<T> = (value: T) => PropertyValidationResult<T>;

export abstract class ObjectValidator<T extends StringMap | NumberMap> {
  protected abstract required: string[];
  protected abstract optional: string[];
  protected abstract propertyValidators: {[P in keyof T]: PropertyValidationFunction<T[P]>};

  validate(object: T): null | ObjectValidationResult<T> {
    const propertyNames = Object.getOwnPropertyNames(object);
    const properties = new Set(propertyNames);

    const required = new Set(this.required);
    const optional = new Set(this.optional);

    const missingProperties = required.difference(properties);
    const unknownProperties = properties.difference(required, optional);
    const knownProperties = required.union(optional).intersect(properties);

    let result: ObjectValidationResult<T> | null = null;

    if (missingProperties.size > 0) {
      if (result == null) {
        result = {};
      }

      result.missing = Array.from(missingProperties);
    }

    if (unknownProperties.size > 0) {
      if (result == null) {
        result = {};
      }

      result.unknown = Array.from(unknownProperties);
    }

    for (const property in object) {
      const value = object[property];
      const propertyValidation = this.propertyValidators[property](value);

      if (propertyValidation != null) {
        if (result == null) {
          result = {};
        }

        if (result.properties == undefined) {
          result.properties = {};
        }

        result.properties[property] = propertyValidation;
      }
    }

    return result;
  }
}