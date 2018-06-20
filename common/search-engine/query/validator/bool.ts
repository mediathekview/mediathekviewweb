import { BoolQuery, QueryBody } from '../';
import { validateArray } from '../../../validator/common';
import { ObjectValidator, PropertyValidationResult } from '../../../validator/validator';
import { QueryBodyValidator } from './search-body';

type BoolQueryBody = PropertyOf<BoolQuery, 'bool'>;

export class BoolQueryValidator extends ObjectValidator<BoolQuery> {
  private readonly boolQueryBodyValidator: BoolQueryBodyValidator;

  protected required = ['bool'];
  protected optional = [];

  protected propertyValidators = {
    bool: (value: BoolQueryBody) => this.boolQueryBodyValidator.validate(value)
  };

  constructor(boolQueryBodyValidator: BoolQueryBodyValidator) {
    super();
    this.boolQueryBodyValidator = boolQueryBodyValidator;
  }
}

export class BoolQueryBodyValidator extends ObjectValidator<BoolQueryBody> {
  private readonly queryBodyValidator: QueryBodyValidator;

  protected required = [];
  protected optional = ['must', 'should', 'not', 'filter'];

  protected propertyValidators = {
    must: (value: QueryBody[]) => this.validateQueryBody(value),
    should: (value: QueryBody[]) => this.validateQueryBody(value),
    not: (value: QueryBody[]) => this.validateQueryBody(value),
    filter: (value: QueryBody[]) => this.validateQueryBody(value)
  };

  constructor(queryBodyValidator: QueryBodyValidator) {
    super();
    this.queryBodyValidator = queryBodyValidator;
  }

  private validateQueryBody(queryBodies: QueryBody[]): PropertyValidationResult {
    return validateArray(queryBodies, (value) => this.queryBodyValidator.validate(value));
  }
}
