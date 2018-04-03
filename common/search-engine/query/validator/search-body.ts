import { BoolQuery, IDsQuery, MatchAllQuery, QueryBody, RangeQuery, RegexQuery, TermQuery, TextQuery } from '..';
import { BoolQueryBodyValidator } from './bool';
import { ObjectValidator } from './validator';


export class QueryBodyValidator extends ObjectValidator<QueryBody> {
  private readonly boolQueryBodyValidator: BoolQueryBodyValidator;

  protected required = [];
  protected optional = [];
  protected propertyValidators = {
    term: (_value?: PropertyOf<TermQuery, 'term'>) => null,
    ids: (_value?: PropertyOf<IDsQuery, 'ids'>) => null,
    matchAll: (_value?: PropertyOf<MatchAllQuery, 'matchAll'>) => null,
    bool: (value?: PropertyOf<BoolQuery, 'bool'>) => this.boolQueryBodyValidator.validate(value as PropertyOf<BoolQuery, 'bool'>),
    range: (_value?: PropertyOf<RangeQuery, 'range'>) => null,
    text: (_value?: PropertyOf<TextQuery, 'text'>) => null,
    regex: (_value?: PropertyOf<RegexQuery, 'regex'>) => null
  };

  constructor() {
    super();
    this.boolQueryBodyValidator = new BoolQueryBodyValidator(this);
  }
}