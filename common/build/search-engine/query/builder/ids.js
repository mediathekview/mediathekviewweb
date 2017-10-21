"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class IDsQueryBuilder {
    add(...ids) {
        this._ids.push(...ids);
        return this;
    }
    build() {
        return { ids: this._ids };
    }
}
exports.IDsQueryBuilder = IDsQueryBuilder;
