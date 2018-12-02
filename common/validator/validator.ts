import '../../../extensions/set';

export type PropertyValidationError = {
  message: string,
  hint?: string
};

export type PropertyValidationResult = null | PropertyValidationError | PropertyValidationError[] | ObjectValidationResult | { [key: string]: PropertyValidationResult } | { [key: number]: PropertyValidationResult };

export type ObjectValidationResult = {
  valid: boolean,
  missing?: string[],
  unknown?: string[],
  errors?: StringMap<PropertyValidationResult>
};

export type PropertyValidationFunction<T> = (value: T) => PropertyValidationResult;

export abstract class ObjectValidator<T extends object = any> {
  protected abstract readonly required: ReadonlyArray<string>;
  protected abstract readonly optional: ReadonlyArray<string>;
  protected abstract readonly propertyValidators: { [P in keyof Required<T>]: PropertyValidationFunction<Required<T>[P]> };
  //protected abstract propertyValidators: { [P in keyof T]: PropertyValidationFunction<T[P]> };

  validate(object: unknown): ObjectValidationResult {
    const resultBuilder = new ObjectValidationResultBuilder();

    const propertyNames = Object.getOwnPropertyNames(object);
    const properties = new Set(propertyNames);

    const required = new Set(this.required);
    const optional = new Set(this.optional);

    const missingProperties = required.difference(properties);
    const unknownProperties = properties.difference(required, optional);
    const knownProperties = required.union(optional).intersect(properties);

    if (missingProperties.size > 0) {
      resultBuilder.addMissing(...missingProperties);
    }

    if (unknownProperties.size > 0) {
      resultBuilder.addMissing(...unknownProperties);
    }

    for (const property of knownProperties) {
      const value = (object as any)[property];
      const propertyValidation = this.propertyValidators[property as keyof T](value);

      if (propertyValidation != null) {
        resultBuilder.setProperty(property, propertyValidation);
      }
    }

    const result = resultBuilder.build();
    return result;
  }
}

class ObjectValidationResultBuilder {
  private missing: string[];
  private unknown: string[];
  private errors: StringMap<PropertyValidationResult>

  constructor() {
    this.missing = [];
    this.unknown = [];
    this.errors = {};
  }

  addMissing(...properties: string[]) {
    this.missing.push(...properties);
  }

  addUnknown(...properties: string[]) {
    this.unknown.push(...properties);
  }

  setProperty(property: string, result: PropertyValidationResult) {
    this.errors[property] = result;
  }

  build(): ObjectValidationResult {
    const errorsCount = Object.keys(this.errors).length;

    const valid = true
      && this.missing.length == 0
      && this.unknown.length == 0
      && errorsCount == 0;

    const result: ObjectValidationResult = { valid };

    if (this.missing.length > 0) {
      result.missing = this.missing;
    }

    if (this.unknown.length > 0) {
      result.unknown = this.unknown;
    }

    if (errorsCount > 0) {
      result.errors = this.errors;
    }

    return result;
  }
}
