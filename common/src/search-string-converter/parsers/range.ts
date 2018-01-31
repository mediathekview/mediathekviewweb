import { text } from "body-parser";

const PARSE_REGEX = /^(?:(>=|<=|<|>|=)?([^-<>=]+)|([^-<>=]+)-([^-<>=]+))$/;

export enum RangeType {
  Equals,
  Less,
  LessEquals,
  Greater,
  GreaterEquals
}

export type Range = { type: RangeType, text: string }

const RangeTypeMap = new Map<string, RangeType>([
  ['', RangeType.Equals],
  ['=', RangeType.Equals],
  ['<', RangeType.Less],
  ['<=', RangeType.LessEquals],
  ['>', RangeType.Greater],
  ['>=', RangeType.GreaterEquals]
]);

export class RangeParser {
  private readonly inclusive: boolean;

  constructor(inclusive: boolean) {
    this.inclusive = inclusive;
  }

  parse(text: string): Range[] | null {
    const match = text.match(PARSE_REGEX);

    if (match == null) {
      return null;
    }

    const [, typeString, value, left, right] = match;

    let result: Range[] = [];

    if (typeString != undefined && value != undefined) {
      const range = this.parseSingle(typeString, value);
      result = [range];
    }
    else if (left != undefined && right != undefined) {
      result = this.parseMulti(left, right);
    } else {
      throw new Error('should not happen');
    }


    return result;
  }

  private parseSingle(typeString: string, value: string): Range {
    const type = RangeTypeMap.get(typeString);

    if (type == undefined) {
      throw new Error('should not happen');
    }

    const range: Range = {
      type: type,
      text: value
    };

    return range;
  }

  private parseMulti(left: string, right: string): Range[] {
    const leftRange: Range = {
      type: this.inclusive ? RangeType.GreaterEquals : RangeType.Greater,
      text: left
    };

    const rightRange: Range = {
      type: this.inclusive ? RangeType.LessEquals : RangeType.Less,
      text: right
    }

    return [leftRange, rightRange];
  }
}