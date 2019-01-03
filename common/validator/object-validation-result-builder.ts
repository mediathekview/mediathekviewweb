import { ObjectValidationResult, PropertyValidationResult } from './validator';

export class ObjectValidationResultBuilder {
  private missing: string[];
  private unknown: string[];
  private errors: StringMap<PropertyValidationResult>;

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

    if (valid) {
      return { valid: true };
    }

    const result: ObjectValidationResult = {};

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
