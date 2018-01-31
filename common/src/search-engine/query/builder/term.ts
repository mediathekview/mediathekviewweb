import { QueryBuilder } from './builder';
import { TermQuery, TermQueryValue } from '../';

export class TermQueryBuilder extends QueryBuilder {
  private _field: string;
  private _value: TermQueryValue;

  field(field: string): TermQueryBuilder {
    this._field = field;

    return this;
  }

  value(value: TermQueryValue): TermQueryBuilder {
    this._value = value;

    return this;
  }

  build(): TermQuery {
    return {
      term: {
        field: this._field,
        value: this._value
      }
    };
  }
}
