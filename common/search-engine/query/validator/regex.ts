import { RegexQueryBody } from '../definition';
import { validateString } from './common';
import { ObjectValidator } from './validator';

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