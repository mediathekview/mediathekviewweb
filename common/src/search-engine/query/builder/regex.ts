import { IQueryBuilder } from './';
import { IRegexQuery, Operator } from '../';

export class RegexQueryBuilder implements IQueryBuilder {
  private _fields: string[] = [];
  private _expression: string | null = null;
  private _operator: Operator = 'and';

  fields(...fields: string[]): RegexQueryBuilder {
    if (fields.length == 0) {
      throw new Error('no field specified');
    }

    this._fields = fields;

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

  build(): IRegexQuery {
    if (this._fields.length == 0) {
      throw new Error('no fields specified');
    }
    if (this._expression == null) {
      throw new Error('no expression specified');
    }

    const queryObj: IRegexQuery = {
      regex: {
        fields: this._fields,
        expression: this._expression,
        operator: this._operator
      }
    };

    return queryObj;
  }
}
