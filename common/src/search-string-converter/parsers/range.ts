const PARSE_REGEX = /^(?:(>=|<=|<|>|=)?([^-<>=]+)|([^-<>=]+)-([^-<>=]+))$/;

export enum RangeType {
  Equals,
  Less,
  LessEquals,
  Greater,
  GreateEquals
}

export type Range = { type: RangeType, text: string }

const RangeTypeMap = new Map<string, RangeType>([
  ['', RangeType.Equals],
  ['=', RangeType.Equals],
  ['<', RangeType.Less],
  ['<=', RangeType.LessEquals],
  ['>', RangeType.Greater],
  ['>=', RangeType.GreateEquals]
]);

export class RangeParser {
  private readonly inclusive: boolean;

  constructor(inclusive: boolean) {
    this.inclusive = inclusive;
  }

  parse(text: string): Range[] {
    const match = text.match(PARSE_REGEX);
    const [, typeString, value, left, right] = match;

    let result: Range[];
    if (typeString != undefined && value != undefined) {
      const range = this.parseSingle(typeString, value);
      result = [range];
    }
  }

  private parseSingle(typeString: string, value: string): Range {
    const type = RangeTypeMap.get(typeString);

    const range: Range = {
      type: type,
      text: value
    };

    return range;
  }

  private parseMulti() {
    throw new Error('not implemented');
  }
}