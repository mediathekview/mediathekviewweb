import type { RangeQuery } from '../definition';
import { QueryBuilder } from './builder';

export class RangeQueryBuilder extends QueryBuilder {
  private _field?: string;
  private _lt?: number;
  private _lte?: number;
  private _gt?: number;
  private _gte?: number;

  build(): RangeQuery {
    if (this._field == undefined) {
      throw new Error('field not set');
    }

    const queryObj: RangeQuery = {
      range: {
        field: this._field
      }
    };

    if (this._lt != undefined) {
      queryObj.range.lt = { value: this._lt };
    }

    if (this._lte != undefined) {
      queryObj.range.lte = { value: this._lte };
    }

    if (this._gt != undefined) {
      queryObj.range.gt = { value: this._gt };
    }

    if (this._gte != undefined) {
      queryObj.range.gte = { value: this._gte };
    }

    return queryObj;
  }

  field(field: string): RangeQueryBuilder {
    this._field = field;
    return this;
  }

  lt(value: number): RangeQueryBuilder {
    this._lt = value;
    return this;
  }

  lte(value: number): RangeQueryBuilder {
    this._lte = value;
    return this;
  }

  gt(value: number): RangeQueryBuilder {
    this._gt = value;
    return this;
  }

  gte(value: number): RangeQueryBuilder {
    this._gte = value;
    return this;
  }
}
