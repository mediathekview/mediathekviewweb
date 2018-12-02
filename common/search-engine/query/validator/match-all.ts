import { ObjectValidator } from '../../../validator/validator';
import { MatchAllQueryBody } from '../definition';

export class MatchAllQueryValidator extends ObjectValidator<MatchAllQueryBody> {
  protected required = [];
  protected optional = [];
  protected propertyValidators = {};

  constructor() {
    super();
  }
}