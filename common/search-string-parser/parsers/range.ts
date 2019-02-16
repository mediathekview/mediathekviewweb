const PARSE_REGEX = /^(?:(>=|<=|<|>|=|)(?:([^-"<>=]+)|"(.+?)")|(?:([^-"<>=]+)|"(.+?)")-(?:([^-"<>=]+)|"(.+?)"))$/;

export enum RangeType {
  Equals,
  Less,
  LessEquals,
  Greater,
  GreaterEquals
}

export type Range = { type: RangeType, text: string };

const RANGE_TYPE_MAP = new Map<string, RangeType>([
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

  parse(text: string): Range[] | undefined {
    const match = text.match(PARSE_REGEX);

    if (match == undefined) {
      return undefined;
    }

    const [, rangeTypeString, unquotedValue, quotedValue, unquotedLeft, quotedLeft, unquotedRight, quotedRight] = match;

    const value = (unquotedValue != undefined) ? unquotedValue : quotedValue;
    const left = (unquotedLeft != undefined) ? unquotedLeft : quotedLeft;
    const right = (unquotedRight != undefined) ? unquotedRight : quotedRight;

    let result: Range[] = [];

    if (rangeTypeString != undefined && value != undefined) {
      const range = this.parseSingle(rangeTypeString, value);
      result = [range];
    }
    else if (left != undefined && right != undefined) {
      result = this.parseMulti(left, right);
    }
    else {
      throw new Error('should not happen');
    }

    return result;
  }

  private parseSingle(typeString: string, text: string): Range {
    const type = RANGE_TYPE_MAP.get(typeString);

    if (type == undefined) {
      throw new Error('should not happen');
    }

    const range: Range = { type, text };
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
    };

    return [leftRange, rightRange];
  }
}
