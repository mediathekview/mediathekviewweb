import { validateString } from '../../../validator/common';
import { ObjectValidator } from '../../../validator/validator';
import { RegexQueryBody } from '../definition';

export class RegexQueryValidator extends ObjectValidator<RegexQueryBody> {
  protected required = ['field', 'expression'];
  protected optional = [];

  protected propertyValidators = {
    field: (value: string) => validateString(value),
    expression: (value: string) => validateString(value)
  };

  constructor() {
    super();
  }
}