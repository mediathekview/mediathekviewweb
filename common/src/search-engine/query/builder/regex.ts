import { IQueryBuilder } from './';
import { IRegexQuery, Operator } from '../';

export class RegexQueryBuilder implements IQueryBuilder {
  private _field: string | null = null;
  private _expression: string | null = null;

  field(field: string): RegexQueryBuilder {
    this._field = field;
    return this;
  }

  expression(expression: string): RegexQueryBuilder {
    this._expression = expression;
    return this;
  }

  build(): IRegexQuery {
    if (this._field == null) {
      throw new Error('no field specified');
    }

    if (this._expression == null) {
      throw new Error('no expression specified');
    }

    const queryObj: IRegexQuery = {
      regex: {
        field: this._field,
        expression: this._expression
      }
    };

    return queryObj;
  }
}
