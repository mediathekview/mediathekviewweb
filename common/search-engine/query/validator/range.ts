import { RangeQueryBody, RangeQueryValue } from '../definition';
import { validateString, validateType } from './common';
import { ObjectValidator } from './validator';

const RANGE_QUERY_VALUE_TYPES = ['string', 'number', 'date'];

export class RangeQueryValidator extends ObjectValidator<RangeQueryBody> {
  protected required = ['field'];
  protected optional = ['lt', 'lte', 'gt', 'gte'];

  protected propertyValidators = {
    field: (value: string) => validateString(value),
    lt: (value: RangeQueryValue) => validateType(value, RANGE_QUERY_VALUE_TYPES),
    lte: (value: RangeQueryValue) => validateType(value, RANGE_QUERY_VALUE_TYPES),
    gt: (value: RangeQueryValue) => validateType(value, RANGE_QUERY_VALUE_TYPES),
    gte: (value: RangeQueryValue) => validateType(value, RANGE_QUERY_VALUE_TYPES)
  };

  constructor() {
    super();
  }
}