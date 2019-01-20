import { Field } from '../../../model';
import { RegexQuery } from '../definition';
import { QueryBuilder } from './builder';

export class RegexQueryBuilder extends QueryBuilder {
  private _field?: Field;
  private _expression?: string;

  constructor() {
    super();
  }

  field(field: Field): RegexQueryBuilder {
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
    if (this._field == undefined) {
      throw new Error('no field specified');
    }
    if (this._expression == undefined) {
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
