import { validateArray, validateString } from './common';
import { PropertyValidationResult } from './validator';

export class IdsQueryValidator {
  public validate(ids: string[]): PropertyValidationResult {
    return validateArray(ids, validateString);
  }
}
