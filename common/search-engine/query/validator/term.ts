import { TermQueryBody, TermQueryValue } from '../definition';
import { ObjectValidator } from '../../../validator/validator';
import { validateString, validateType } from '../../../validator/common';

export class TermQueryValidator extends ObjectValidator<TermQueryBody> {
  protected required = ['field', 'value'];
  protected optional = [];

  protected propertyValidators = {
    field: (value: string) => validateString(value),
    value: (value: TermQueryValue) => validateType(value, 'string', 'number', 'boolean', 'date')
  };

  constructor() {
    super();
  }
}
