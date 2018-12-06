import { validateArray, validateString, validateValue } from '../../../validator/common';
import { ObjectValidator } from '../../../validator/validator';
import { Operators } from '../definition';
import { TextQueryBody } from '../query-bodies';

export class TextQueryValidator extends ObjectValidator<TextQueryBody> {
  protected required = ['fields', 'text', 'operator'];
  protected optional = [];

  protected propertyValidators = {
    fields: (value: string[]) => validateArray(value, validateString),
    text: (value: string) => validateString(value),
    operator: (value: Operators) => validateValue(value, ['and', 'or'])
  };

  constructor() {
    super();
  }
}
