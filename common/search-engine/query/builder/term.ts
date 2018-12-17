import { TermQuery, TermQueryValue } from '../definition';
import { QueryBuilder } from './builder';

export class TermQueryBuilder extends QueryBuilder {
  private _field: string | null;
  private _value: TermQueryValue | null;

  constructor() {
    super();

    this._field = null;
    this._value = null;
  }

  field(field: string): TermQueryBuilder {
    this._field = field;
    return this;
  }

  value(value: TermQueryValue): TermQueryBuilder {
    this._value = value;
    return this;
  }

  build(): TermQuery {
    if (this._field == null) {
      throw new Error('field not set');
    }

    if (this._value == null) {
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
