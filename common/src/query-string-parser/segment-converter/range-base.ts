import { Segment } from '../definitions';
import { IQueryBuilder, RangeQueryBuilder } from '../../search-engine';
import { SegmentConverter } from './interface';

/*
  TIME/DURATION FORMAT: value[unit[value[unit[value[unit]]]]] a number (decimals allowed) followed by unit, chainable like 3h50min15s8ms or 1.5h30s
  DATE FORMAT: seperators are '.' and '/' d[d][.m[m][.yy[yy]]] day, optional month, optional year either 1 or 2 digits for day/month and 2 or 4 for year
  LESS_GREATER_EQUAL: optional prepend <, >, =, <=, >= to set range
  BETWEEN: time-time or duration-duration or date-date
*/

const TIME_LESS_GREATER_EQUAL_REGEX = /^([<>]?=?)((?:\d+(?:[\.,]\d+)?[a-zA-Z]*)+)$/;
const TIME_BETWEEN_REGEX = /^((?:\d+(?:[\.,]\d+)?[a-zA-Z]*)+)-((?:\d+(?:[\.,]\d+)?[a-zA-Z]*)+)$/;
const DATE_LESS_GREATER_EQUAL_REGEX = /^([<>]?=?)(\d{1,2})(?:[\/\.](\d{1,2})(?:[\/\.](\d{2}|\d{4}))?)?$/;
const DATE_BETWEEN_REGEX = /^(?:(\d{1,2})(?:[\/\.](\d{1,2})(?:[\/\.](\d{2}|\d{4}))?)?)-(?:(\d{1,2})(?:[\/\.](\d{1,2})(?:[\/\.](\d{2}|\d{4}))?)?)$/;

const TIME_VALUE_UNIT_REGEX = /(\d+(?:[\.,]\d+)?)([a-zA-Z]+)?/;

type ValueUnitStringPair = { value: number, unitString: string | null };

export type Unit = { regex: RegExp, multiplier: number };

export enum RangeType {
  Time,
  Date
}

export abstract class RangeSegmentConverter implements SegmentConverter {
  constructor(private selectorRegex: RegExp, private rangeType: RangeType, private field: string, private timeUnits: Unit[], private defaultTimeUnitMultiplier: number | null) {
  }

  canHandle(segment: Segment): boolean {
    if (segment.selector == null || !this.selectorRegex.test(segment.selector)) {
      return false;
    }

    let canHandle = false;

    switch (this.rangeType) {
      case RangeType.Time:
        if (TIME_LESS_GREATER_EQUAL_REGEX.test(segment.text)) {
          const match = segment.text.match(TIME_LESS_GREATER_EQUAL_REGEX) as RegExpMatchArray;
          const range = match[1];
          const value = match[2];

          return this.isValidTimeString(value);
        }
        else if (TIME_BETWEEN_REGEX.test(segment.text)) {
          const match = segment.text.match(TIME_BETWEEN_REGEX) as RegExpExecArray;
          const value1 = match[1];
          const value2 = match[2];

          return this.isValidTimeString(value1) && this.isValidTimeString(value2);
        } else {
          return false;
        }

      case RangeType.Date:
        return DATE_LESS_GREATER_EQUAL_REGEX.test(segment.text) || DATE_BETWEEN_REGEX.test(segment.text);

      default:
        throw new Error('invalid rangeType');
    }
  }

  convert(segment: Segment): IQueryBuilder {
    if (!this.canHandle(segment)) {
      throw new Error('cannot handle segment');
    }

    let queryBuilder = new RangeQueryBuilder();
    queryBuilder.field(this.field);

    switch (this.rangeType) {
      case RangeType.Time:
        if (TIME_LESS_GREATER_EQUAL_REGEX.test(segment.text)) {
          const match = segment.text.match(TIME_LESS_GREATER_EQUAL_REGEX) as RegExpMatchArray;
          const range = match[1];
          const value = this.timeStringToActualValue(match[2]);

          switch (range) {
            case '=':
            case '':
              queryBuilder.lte(value).gte(value);
              break;

            case '<':
              queryBuilder.lt(value);
              break;

            case '<=':
              queryBuilder.lte(value);
              break;

            case '>':
              queryBuilder.gt(value);
              break;

            case '>=':
              queryBuilder.gte(value);
              break;
          }
        }
        else if (TIME_BETWEEN_REGEX.test(segment.text)) {
          const match = segment.text.match(TIME_BETWEEN_REGEX) as RegExpExecArray;
          const value1 = this.timeStringToActualValue(match[1]);
          const value2 = this.timeStringToActualValue(match[2]);

          queryBuilder.gte(value1).lte(value2)
        } else {
          throw new Error('invalid segment text');
        }

      case RangeType.Date:
        return DATE_LESS_GREATER_EQUAL_REGEX.test(segment.text) || DATE_BETWEEN_REGEX.test(segment.text);

      default:
        throw new Error('invalid rangeType');
    }

    throw new Error('not implemented');
  }

  private timeStringToActualValue(text: string): number {
    const pairs = this.getValueUnitStringPairs(text);

    let value = 0;

    for (let pair of pairs) {
      if (pair.unitString == null) {
        if (this.defaultTimeUnitMultiplier == null) {
          throw new Error('no unit and no defaultTimeUnitMultiplier specified');
        }

        value += pair.value * this.defaultTimeUnitMultiplier;
        continue;
      }

      for (let unit of this.timeUnits) {
        if (unit.regex.test(pair.unitString)) {
          value += pair.value * unit.multiplier;
          break;
        }
      }
    }

    return value;
  }

  private isValidTimeString(text: string): boolean {
    let valueUnitStringPairs = this.getValueUnitStringPairs(text);

    for (let valueUnitStringPair of valueUnitStringPairs) {
      if (valueUnitStringPair.unitString == null) {
        return this.defaultTimeUnitMultiplier != null;
      }

      for (let unit of this.timeUnits) {
        if (unit.regex.test(valueUnitStringPair.unitString)) {
          return true;
        }
      }
    }

    return false;
  }

  private getValueUnitStringPairs(text: string): ValueUnitStringPair[] {
    const pairs: ValueUnitStringPair[] = [];

    let match: RegExpExecArray | null;
    while ((match = TIME_VALUE_UNIT_REGEX.exec(text)) != null) {
      const value = parseFloat(match[1].replace(',', '.'));
      const unitString = match[2] != undefined ? match[2] : null;

      pairs.push({ value: value, unitString: unitString });
    }

    return pairs;
  }
}
