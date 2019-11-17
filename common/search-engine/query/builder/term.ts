import { Field } from '../../../models';
import { TermQuery, TermQueryValue } from '../definition';
import { QueryBuilder } from './builder';

export class TermQueryBuilder extends QueryBuilder {
  private _field?: Field;
  private _value?: TermQueryValue;

  constructor() {
    super();
  }

  field(field: Field): TermQueryBuilder {
    this._field = field;
    return this;
  }

  value(value: TermQueryValue): TermQueryBuilder {
    this._value = value;
    return this;
  }

  build(): TermQuery {
    if (this._field == undefined) {
      throw new Error('field not set');
    }

    if (this._value == undefined) {
      throw new Error('value not set');
    }

    return {
      term: {
        field: this._field,
        value: this._value
      }
    };
  }
}
