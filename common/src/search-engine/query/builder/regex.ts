import { RegexQuery } from '../';
import { QueryBuilder } from './builder';

export class RegexQueryBuilder extends QueryBuilder {
  private _field: string | null;
  private _expression: string | null;

  constructor() {
    super();

    this._field = null;
    this._expression = null;
  }

  field(field: string): RegexQueryBuilder {
    if (field.length == 0) {
      throw new Error('no field specified');
    }

    this._field = field;

    return this;
  }

  expression(expression: string): RegexQueryBuilder {
    this._expression = expression;
    return this;
  }

  build(): RegexQuery {
    if (this._field == null) {
      throw new Error('no field specified');
    }
    if (this._expression == null) {
      throw new Error('no expression specified');
    }

    const queryObj: RegexQuery = {
      regex: {
        field: this._field,
        expression: this._expression
      }
    };

    return queryObj;
  }
}
