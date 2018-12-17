import { nullOrUndefined } from '../../../validator/common';
import { ObjectValidator } from '../../../validator/validator';
import { QueryBody } from '../definition';
import { BoolQueryBody, IDsQueryBody, MatchAllQueryBody, RangeQueryBody, RegexQueryBody, TermQueryBody, TextQueryBody } from '../query-bodies';
import { BoolQueryBodyValidator } from './bool';
import { IdsQueryValidator } from './ids';
import { MatchAllQueryValidator } from './match-all';
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
    term: (value: TermQueryBody | undefined) => nullOrUndefined(value, (value) => this.termQueryValidator.validate(value)),
    ids: (value: IDsQueryBody | undefined) => nullOrUndefined(value, (value) => this.idsQueryValidator.validate(value)),
    matchAll: (value: MatchAllQueryBody | undefined) => nullOrUndefined(value, (value) => this.matchAllQueryValidator.validate(value)),
    bool: (value: BoolQueryBody | undefined) => nullOrUndefined(value, (value) => this.boolQueryBodyValidator.validate(value)),
    range: (value: RangeQueryBody | undefined) => nullOrUndefined(value, (value) => this.rangeQueryValidator.validate(value)),
    text: (value: TextQueryBody | undefined) => nullOrUndefined(value, (value) => this.textQueryValidator.validate(value)),
    regex: (value: RegexQueryBody | undefined) => nullOrUndefined(value, (value) => this.regexQueryValidator.validate(value))
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
