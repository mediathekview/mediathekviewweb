import { ObjectValidator } from '../../../validator/validator';
import { MatchAllQueryBody } from '../query-bodies';

export class MatchAllQueryValidator extends ObjectValidator<MatchAllQueryBody> {
  protected required = [];
  protected optional = [];
  protected propertyValidators = {};

  constructor() {
    super();
  }
}
