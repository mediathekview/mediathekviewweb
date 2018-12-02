import { SearchQuery } from '../../common/search-engine/query';
import { QueryBodyValidator } from '../../common/search-engine/query/validator';
import { nullOrUndefined, validateType } from '../../common/validator/common';
import { ObjectValidator } from '../../common/validator/validator';

export class SearchQueryValidator extends ObjectValidator<SearchQuery> {
  private readonly queryBodyValidator: QueryBodyValidator;

  protected required = ['body'];
  protected optional = ['skip', 'limit', 'sort'];

  protected propertyValidators = {
    body: (body: unknown) => nullOrUndefined(body, (body) => this.queryBodyValidator.validate(body)),
    skip: (skip: unknown) => validateType(skip, 'number'),
    limit: (skip: unknown) => validateType(skip, 'number'),
    sort: (skip: unknown) => validateType(skip, 'number')
  };

  constructor() {
    super();
    this.queryBodyValidator = new QueryBodyValidator();
  }
}
