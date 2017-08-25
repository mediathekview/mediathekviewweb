import { IQueryBuilder } from './';
import { ITextQuery, Operator } from '../';

export class TextQueryBuilder implements IQueryBuilder {
  private _fields: string[] = [];
  private _text: string | null = null;
  private _operator: Operator;

  fields(...fields: string[]): TextQueryBuilder {
    if (fields.length == 0) {
      throw new Error('no field specified');
    }

    this._fields = fields;

    return this;
  }

  text(text: string, operator: Operator = 'and'): TextQueryBuilder {
    if (operator != 'or' && operator != 'and') {
      throw new Error('operator is neither and nor or'); //just in case a passed string isn't and | or
    }

    this._text = text;
    this._operator = operator;

    return this;
  }

  build(): ITextQuery {
    if (this._text == null) {
      throw new Error('no text specified');
    }

    const queryObj: ITextQuery = {
      text: {
        fields: this._fields,
        text: this._text,
        operator: this._operator
      }
    };

    return queryObj;
  }
}
