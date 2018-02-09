import { QueryBuilder } from './builder';
import { TextQuery, Operator } from '../';

export class TextQueryBuilder extends QueryBuilder {
  private _fields: string[];
  private _text: string | null;
  private _operator: Operator;

  constructor() {
    super();

    this._fields = [];
    this._text = null;
    this._operator = 'and';
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
    if (operator != 'or' && operator != 'and') {
      throw new Error('operator is neither and nor or'); //just in case a passed string isn't and | or
    }

    this._operator = operator;

    return this;
  }

  build(): TextQuery {
    if (this._fields.length == 0) {
      throw new Error('no fields specified');
    }
    if (this._text == null) {
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
