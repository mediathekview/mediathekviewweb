import { QueryBody } from '..';
import { ObjectValidator } from '../../../validator/validator';
import { BoolQueryBody, IDsQueryBody, MatchAllQueryBody, RangeQueryBody, RegexQueryBody, TermQueryBody, TextQueryBody } from '../definition';
import { BoolQueryBodyValidator } from './bool';
import { IdsQueryValidator } from './ids';
import { MatchAllQueryValidator } from './matchAll';
import { RangeQueryValidator } from './range';
import { RegexQueryValidator } from './regex';
import { TermQueryValidator } from './term';
import { TextQueryValidator } from './text';

export class QueryBodyValidator extends ObjectValidator<QueryBody> {
  private readonly termQueryValidator: TermQueryValidator;
  private readonly boolQueryBodyValidator: BoolQueryBodyValidator;
  private readonly idsQueryValidator: IdsQueryValidator;
  private readonly matchAllQueryValidator: MatchAllQueryValidator;
  private readonly rangeQueryValidator: RangeQueryValidator;
  private readonly textQueryValidator: TextQueryValidator;
  private readonly regexQueryValidator: RegexQueryValidator;

  protected required = [];
  protected optional = ['term', 'ids', 'matchAll', 'bool', 'range', 'text', 'regex'];

  protected propertyValidators = {
    term: (value: TermQueryBody) => this.termQueryValidator.validate(value),
    ids: (value: IDsQueryBody) => this.idsQueryValidator.validate(value),
    matchAll: (value: MatchAllQueryBody) => this.matchAllQueryValidator.validate(value),
    bool: (value: BoolQueryBody) => this.boolQueryBodyValidator.validate(value),
    range: (value: RangeQueryBody) => this.rangeQueryValidator.validate(value),
    text: (value: TextQueryBody) => this.textQueryValidator.validate(value),
    regex: (value: RegexQueryBody) => this.regexQueryValidator.validate(value)
  };

  constructor() {
    super();

    this.termQueryValidator = new TermQueryValidator();
    this.boolQueryBodyValidator = new BoolQueryBodyValidator(this);
    this.idsQueryValidator = new IdsQueryValidator();
    this.matchAllQueryValidator = new MatchAllQueryValidator();
    this.rangeQueryValidator = new RangeQueryValidator();
    this.textQueryValidator = new TextQueryValidator();
    this.regexQueryValidator = new RegexQueryValidator();
  }
}
