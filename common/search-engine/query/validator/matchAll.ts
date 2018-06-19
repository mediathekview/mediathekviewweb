import { MatchAllQueryBody } from '../definition';
import { ObjectValidator } from './validator';

export class MatchAllQueryValidator extends ObjectValidator<MatchAllQueryBody> {
  protected required = [];
  protected optional = [];
  protected propertyValidators = {};

  constructor() {
    super();
  }
}