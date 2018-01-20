import { QueryBuilder } from './builder';
import { RegexQuery, Operator } from '../';

export class RegexQueryBuilder extends QueryBuilder {
  private _field: string | null = null;
  private _expression: string | null = null;
  private _operator: Operator = 'and';

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

  operator(operator: Operator): RegexQueryBuilder {
    if (operator != 'or' && operator != 'and') {
      throw new Error('operator is neither and nor or'); //just in case a passed string isn't and | or
    }

    this._operator = operator;

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
        expression: this._expression,
        operator: this._operator
      }
    };

    return queryObj;
  }
}
