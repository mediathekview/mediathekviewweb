"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const search_engine_1 = require("../../search-engine");
class TextSegmentConverter {
    constructor(selectorRegex, operator, fields) {
        this.operator = operator;
        this.selectorRegex = selectorRegex;
        this._fields = Array.isArray(fields) ? fields : [fields];
    }
    canHandle(segment) {
        const canHandle = segment.selector != null && this.selectorRegex.test(segment.selector);
        return canHandle;
    }
    convert(segment) {
        if (!this.canHandle(segment)) {
            throw new Error('cannot handle segment');
        }
        let queryBuilder;
        if (segment.regex) {
            queryBuilder = new search_engine_1.RegexQueryBuilder().fields(...this._fields).expression(segment.text).operator(this.operator);
        }
        else {
            queryBuilder = new search_engine_1.TextQueryBuilder().fields(...this._fields).text(segment.text).operator(this.operator);
        }
        return queryBuilder;
    }
}
exports.TextSegmentConverter = TextSegmentConverter;
