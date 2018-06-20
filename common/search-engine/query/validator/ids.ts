import { validateArray, validateString } from '../../../validator/common';
import { PropertyValidationResult } from '../../../validator/validator';

export class IdsQueryValidator {
  public validate(ids: string[]): PropertyValidationResult {
    return validateArray(ids, validateString);
  }
}
