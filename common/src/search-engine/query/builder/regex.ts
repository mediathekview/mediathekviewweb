import { QueryBuilder } from './builder';
import { RegexQuery } from '../';

export class RegexQueryBuilder extends QueryBuilder {
  private _field: string | null = null;
  private _expression: string | null = null;

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
