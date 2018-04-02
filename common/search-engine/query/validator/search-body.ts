import { BoolQuery, IDsQuery, MatchAllQuery, QueryBody, RangeQuery, RegexQuery, TermQuery, TextQuery } from '..';
import { BoolQueryBodyValidator } from './bool';
import { ObjectValidator } from './validator';


export class QueryBodyValidator extends ObjectValidator<QueryBody> {
  private readonly boolQueryBodyValidator: BoolQueryBodyValidator;

  protected required = [];
  protected optional = [];
  protected propertyValidators = {
    term: (value?: PropertyOf<TermQuery, 'term'>) => null,
    ids: (value?: PropertyOf<IDsQuery, 'ids'>) => null,
    matchAll: (value?: PropertyOf<MatchAllQuery, 'matchAll'>) => null,
    bool: (value?: PropertyOf<BoolQuery, 'bool'>) => this.boolQueryBodyValidator.validate(value as PropertyOf<BoolQuery, 'bool'>),
    range: (value?: PropertyOf<RangeQuery, 'range'>) => null,
    text: (value?: PropertyOf<TextQuery, 'text'>) => null,
    regex: (value?: PropertyOf<RegexQuery, 'regex'>) => null
  };

  constructor() {
    super();
    this.boolQueryBodyValidator = new BoolQueryBodyValidator(this);
  }
}