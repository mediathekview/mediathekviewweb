"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BoolQueryBuilder {
    constructor() {
        this._must = [];
        this._should = [];
        this._not = [];
        this._filter = [];
    }
    build() {
        const queryObj = {
            bool: {}
        };
        if (this._must.length > 0) {
            queryObj.bool.must = this._must.map((queryBuilder) => queryBuilder.build());
        }
        if (this._should.length > 0) {
            queryObj.bool.should = this._should.map((queryBuilder) => queryBuilder.build());
        }
        if (this._not.length > 0) {
            queryObj.bool.not = this._not.map((queryBuilder) => queryBuilder.build());
        }
        if (this._filter.length > 0) {
            queryObj.bool.filter = this._filter.map((queryBuilder) => queryBuilder.build());
        }
        return queryObj;
    }
    must(...queries) {
        this._must.push(...queries);
        return this;
    }
    should(...queries) {
        this._should.push(...queries);
        return this;
    }
    not(...queries) {
        this._not.push(...queries);
        return this;
    }
    filter(...queries) {
        this._filter.push(...queries);
        return this;
    }
}
exports.BoolQueryBuilder = BoolQueryBuilder;
