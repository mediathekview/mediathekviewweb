import { BoolQuery, QueryBody } from '../';
import { QueryBodyValidator } from './search-body';
import { ObjectValidator, PropertyValidationFunction, PropertyValidationResult } from './validator';

type BoolQueryBody = PropertyOf<BoolQuery, 'bool'>;

export class BoolQueryValidator extends ObjectValidator<BoolQuery> {
  private readonly boolQueryBodyValidator: BoolQueryBodyValidator;

  protected required = [];
  protected optional = [];
  protected propertyValidators = { bool: (value: BoolQueryBody) => this.boolQueryBodyValidator.validate(value) };

  constructor(boolQueryBodyValidator: BoolQueryBodyValidator) {
    super();
    this.boolQueryBodyValidator = boolQueryBodyValidator;
  }
}

export class BoolQueryBodyValidator extends ObjectValidator<BoolQueryBody> {
  private readonly queryBodyValidator: QueryBodyValidator;

  protected required = [];
  protected optional = [];
  protected propertyValidators = {
    must: (value?: QueryBody[]) => this.validateQueryBody(value as QueryBody[]),
    should: (value?: QueryBody[]) => this.validateQueryBody(value as QueryBody[]),
    not: (value?: QueryBody[]) => this.validateQueryBody(value as QueryBody[]),
    filter: (value?: QueryBody[]) => this.validateQueryBody(value as QueryBody[])
  };

  constructor(queryBodyValidator: QueryBodyValidator) {
    super();
    this.queryBodyValidator = queryBodyValidator;
  }

  private validateQueryBody(queryBodies: QueryBody[]): PropertyValidationResult<NumberMap<QueryBody>> {
    const result: NumberMap = {};

    queryBodies
      .map((queryBody, index) => ({ subResult: this.queryBodyValidator.validate(queryBody), index }))
      .filter(({ subResult }) => subResult != null)
      .forEach(({ subResult, index }) => result[index] = subResult);

    return result;
  }
}
