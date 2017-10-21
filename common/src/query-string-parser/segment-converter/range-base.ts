import { Segment } from '../definitions';
import { IQueryBuilder, RangeQueryBuilder } from '../../search-engine';
import { SegmentConverter } from './interface';

/*
  TIME/DURATION FORMAT: value[unit[value[unit[value[unit]]]]] a number (decimals allowed) followed by unit, chainable like 3h50min15s8ms or 1.5h30s
  DATE FORMAT: seperators are '.' and '/' d[d][.m[m][.yy[yy]]] day, month, year either 1 or 2 digits for day/month and 2 or 4 for year
  LESS_GREATER_EQUAL: optional prepend <, >, =, <=, >= to set range
  BETWEEN: time-time or duration-duration or date-date
*/

const TIME_LESS_GREATER_EQUAL_REGEX = /^([<>]?=?)((?:\d+(?:[\.,]\d+)?[a-zA-Z]*)+)$/;
const TIME_BETWEEN_REGEX = /^((?:\d+(?:[\.,]\d+)?[a-zA-Z]*)+)-((?:\d+(?:[\.,]\d+)?[a-zA-Z]*)+)$/;
const DATE_LESS_GREATER_EQUAL_REGEX = /^([<>]?=?)(\d{1,2})(?:[\/\.](\d{1,2})(?:[\/\.](\d{2}|\d{4}))?)?$/;
const DATE_BETWEEN_REGEX = /^(?:(\d{1,2})(?:[\/\.](\d{1,2})(?:[\/\.](\d{2}|\d{4}))?)?)-(?:(\d{1,2})(?:[\/\.](\d{1,2})(?:[\/\.](\d{2}|\d{4}))?)?)$/;

export type Unit = { regex: RegExp, multiplier: number };

export abstract class RangeSegmentConverter implements SegmentConverter {
  selectorRegex: RegExp;

  constructor(selectorRegex: RegExp, private field: string) {
    this.selectorRegex = selectorRegex;
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


    throw new Error('not implemented');
  }
}
