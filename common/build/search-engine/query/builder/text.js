"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TextQueryBuilder {
    constructor() {
        this._fields = [];
        this._text = null;
        this._operator = 'and';
    }
    fields(...fields) {
        this._fields = fields;
        return this;
    }
    text(text) {
        this._text = text;
        return this;
    }
    operator(operator) {
        if (operator != 'or' && operator != 'and') {
            throw new Error('operator is neither and nor or');
        }
        this._operator = operator;
        return this;
    }
    build() {
        if (this._fields.length == 0) {
            throw new Error('no fields specified');
        }
        if (this._text == null) {
            throw new Error('no text specified');
        }
        const queryObj = {
            text: {
                fields: this._fields,
                text: this._text,
                operator: this._operator
            }
        };
        return queryObj;
    }
}
exports.TextQueryBuilder = TextQueryBuilder;
