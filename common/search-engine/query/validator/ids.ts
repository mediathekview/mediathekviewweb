import { IDsQuery } from '../';
import { ObjectValidator, PropertyValidationResult, PropertyValidationError } from './validator';

export class IdsQueryValidator extends ObjectValidator<IDsQuery> {
  protected required = [];
  protected optional = [];
  protected propertyValidators = {
    ids: (value: string[]) => this.validateIds(value)
  };

  private validateIds(ids: string[]): PropertyValidationResult<string[]> {
    const result: NumberMap = {};

    ids
      .map((id, index) => ({ subResult: this.validateId(id), index }))
      .filter(({ subResult }) => subResult != null)
      .forEach(({ subResult, index }) => result[index] = subResult);

    return result;
  }

  private validateId(id: string): PropertyValidationResult<string> {
    if (typeof id == 'string') {
      return null;
    }

    const error: PropertyValidationError = {
      message: `invalid type ${typeof id}`
    };

    return error;
  }
}