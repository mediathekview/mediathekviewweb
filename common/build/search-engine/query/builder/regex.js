"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RegexQueryBuilder {
    constructor() {
        this._fields = [];
        this._expression = null;
        this._operator = 'and';
    }
    fields(...fields) {
        if (fields.length == 0) {
            throw new Error('no field specified');
        }
        this._fields = fields;
        return this;
    }
    expression(expression) {
        this._expression = expression;
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
        if (this._expression == null) {
            throw new Error('no expression specified');
        }
        const queryObj = {
            regex: {
                fields: this._fields,
                expression: this._expression,
                operator: this._operator
            }
        };
        return queryObj;
    }
}
exports.RegexQueryBuilder = RegexQueryBuilder;
