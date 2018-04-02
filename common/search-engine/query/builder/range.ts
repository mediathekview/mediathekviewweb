import { RangeQuery } from '../';
import { QueryBuilder } from './builder';
import { TimeQueryValueBuilder } from './time-value';

export class RangeQueryBuilder extends QueryBuilder {
  private _field: string | null;
  private _lt: number | string | null;
  private _lte: number | string | null;
  private _gt: number | string | null;
  private _gte: number | string | null;

  constructor() {
    super();

    this._field = null;
    this._lt = null;
    this._lte = null;
    this._gt = null;
    this._gte = null;
  }

  build(): RangeQuery {
    if (this._field == null) {
      throw new Error('field not set');
    }

    const queryObj: RangeQuery = {
      range: {
        field: this._field
      }
    };

    if (this._lt != null) {
      queryObj.range['lt'] = this._lt;
    }
    if (this._lte != null) {
      queryObj.range['lte'] = this._lte;
    }
    if (this._gt != null) {
      queryObj.range['gt'] = this._gt;
    }
    if (this._gte != null) {
      queryObj.range['gte'] = this._gte;
    }

    return queryObj;
  }

  field(field: string): RangeQueryBuilder {
    this._field = field;
    return this;
  }

  lt(value: number | TimeQueryValueBuilder): RangeQueryBuilder {
    this._lt = (value instanceof TimeQueryValueBuilder) ? value.build() : value;
    return this;
  }

  lte(value: number | TimeQueryValueBuilder): RangeQueryBuilder {
    this._lte = (value instanceof TimeQueryValueBuilder) ? value.build() : value;
    return this;
  }

  gt(value: number | TimeQueryValueBuilder): RangeQueryBuilder {
    this._gt = (value instanceof TimeQueryValueBuilder) ? value.build() : value;
    return this;
  }

  gte(value: number | TimeQueryValueBuilder): RangeQueryBuilder {
    this._gte = (value instanceof TimeQueryValueBuilder) ? value.build() : value;
    return this;
  }
}
