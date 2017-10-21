import { Segment } from '../definitions';
import { IQueryBuilder, Operator, RegexQueryBuilder, TextQueryBuilder } from '../../search-engine';
import { SegmentConverter } from './interface';

export abstract class TextSegmentConverter implements SegmentConverter {
  private _fields: string[];

  selectorRegex: RegExp;

  constructor(selectorRegex: RegExp, private operator: Operator, fields: string | string[]) {
    this.selectorRegex = selectorRegex;
    this._fields = Array.isArray(fields) ? fields : [fields];
  }

  canHandle(segment: Segment): boolean {
    const canHandle = segment.selector != null && this.selectorRegex.test(segment.selector);
    return canHandle;
  }

  convert(segment: Segment): IQueryBuilder {
    if (!this.canHandle(segment)) {
      throw new Error('cannot handle segment');
    }

    let queryBuilder: IQueryBuilder;

    if (segment.regex) {
      queryBuilder = new RegexQueryBuilder().fields(...this._fields).expression(segment.text).operator(this.operator);
    } else {
      queryBuilder = new TextQueryBuilder().fields(...this._fields).text(segment.text).operator(this.operator);
    }

    return queryBuilder;
  }
}
