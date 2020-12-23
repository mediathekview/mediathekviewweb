import type { TextQuery } from '../definition';
import { Operator } from '../definition';
import { QueryBuilder } from './builder';

export class TextQueryBuilder extends QueryBuilder {
  private _fields: string[];
  private _text?: string;
  private _operator: Operator;

  constructor() {
    super();

    this._fields = [];
    this._operator = Operator.And;
  }

  fields(...fields: string[]): TextQueryBuilder {
    this._fields = fields;
    return this;
  }

  text(text: string): TextQueryBuilder {
    this._text = text;
    return this;
  }

  operator(operator: Operator): TextQueryBuilder {
    this._operator = operator;
    return this;
  }

  build(): TextQuery {
    if (this._fields.length == 0) {
      throw new Error('no fields specified');
    }
    if (this._text == undefined) {
      throw new Error('no text specified');
    }

    const queryObj: TextQuery = {
      text: {
        fields: this._fields,
        text: this._text,
        operator: this._operator
      }
    };

    return queryObj;
  }
}
