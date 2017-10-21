"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("./");
class RangeQueryBuilder {
    constructor() {
        this._field = null;
        this._lt = null;
        this._lte = null;
        this._gt = null;
        this._gte = null;
    }
    build() {
        if (this._field == null) {
            throw new Error('field not set');
        }
        const queryObj = {
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
    field(field) {
        this._field = field;
        return this;
    }
    lt(value) {
        this._lt = (value instanceof _1.TimeQueryValueBuilder) ? value.build() : value;
        return this;
    }
    lte(value) {
        this._lte = (value instanceof _1.TimeQueryValueBuilder) ? value.build() : value;
        return this;
    }
    gt(value) {
        this._gt = (value instanceof _1.TimeQueryValueBuilder) ? value.build() : value;
        return this;
    }
    gte(value) {
        this._gte = (value instanceof _1.TimeQueryValueBuilder) ? value.build() : value;
        return this;
    }
}
exports.RangeQueryBuilder = RangeQueryBuilder;
