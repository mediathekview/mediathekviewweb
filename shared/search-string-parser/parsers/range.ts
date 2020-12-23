// eslint-disable-next-line prefer-named-capture-group
const PARSE_REGEX = /^(?:(>=|<=|<|>|=|)(?:([^-"<>=]+)|"(.+?)")|(?:([^-"<>=]+)|"(.+?)")-(?:([^-"<>=]+)|"(.+?)"))$/u;

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


export function parseRange(text: string, inclusive: boolean): Range[] | undefined {
  const match = PARSE_REGEX.exec(text);

  if (match == undefined) {
    return undefined;
  }

  const [, rangeTypeString, unquotedValue, quotedValue, unquotedLeft, quotedLeft, unquotedRight, quotedRight] = match;

  const value = (unquotedValue != undefined) ? unquotedValue : quotedValue;
  const left = (unquotedLeft != undefined) ? unquotedLeft : quotedLeft;
  const right = (unquotedRight != undefined) ? unquotedRight : quotedRight;

  let result: Range[] = [];

  if (rangeTypeString != undefined && value != undefined) {
    const range = parseSingle(rangeTypeString, value);
    result = [range];
  }
  else if (left != undefined && right != undefined) {
    result = parseMulti(left, right, inclusive);
  }
  else {
    throw new Error('should not happen');
  }

  return result;
}

function parseSingle(typeString: string, text: string): Range {
  const type = RANGE_TYPE_MAP.get(typeString);

  if (type == undefined) {
    throw new Error('should not happen');
  }

  const range: Range = { type, text };
  return range;
}

function parseMulti(left: string, right: string, inclusive: boolean): Range[] {
  const leftRange: Range = {
    type: inclusive ? RangeType.GreaterEquals : RangeType.Greater,
    text: left
  };

  const rightRange: Range = {
    type: inclusive ? RangeType.LessEquals : RangeType.Less,
    text: right
  };

  return [leftRange, rightRange];
}
