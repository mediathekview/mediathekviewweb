"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TIME_LESS_GREATER_EQUAL_REGEX = /^([<>]?=?)((?:\d+(?:[\.,]\d+)?[a-zA-Z]*)+)$/;
const TIME_BETWEEN_REGEX = /^((?:\d+(?:[\.,]\d+)?[a-zA-Z]*)+)-((?:\d+(?:[\.,]\d+)?[a-zA-Z]*)+)$/;
const DATE_LESS_GREATER_EQUAL_REGEX = /^([<>]?=?)(\d{1,2})(?:[\/\.](\d{1,2})(?:[\/\.](\d{2}|\d{4}))?)?$/;
const DATE_BETWEEN_REGEX = /^(?:(\d{1,2})(?:[\/\.](\d{1,2})(?:[\/\.](\d{2}|\d{4}))?)?)-(?:(\d{1,2})(?:[\/\.](\d{1,2})(?:[\/\.](\d{2}|\d{4}))?)?)$/;
class RangeSegmentConverter {
    constructor(selectorRegex, field) {
        this.field = field;
        this.selectorRegex = selectorRegex;
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
        throw new Error('not implemented');
    }
}
exports.RangeSegmentConverter = RangeSegmentConverter;
