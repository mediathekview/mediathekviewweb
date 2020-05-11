// eslint-disable-next-line prefer-named-capture-group
const PARSE_REGEX = /(\d+(?:[.,]\d+)?)([a-zA-Z]*)/ug;

export type Unit = { pattern: string | RegExp, factor: number };

type SplitResult = { value: number, unitString: string };

export function unitParser(units: Unit[]): (text: string) => number {
  return function parse(text: string): number {
    let total = 0;

    const splits = split(text);

    for (const splitResult of splits) {
      total += parseSplit(units, splitResult);
    }

    return total;
  }
}

function split(text: string): SplitResult[] {
  const regex = new RegExp(PARSE_REGEX); // eslint-disable-line require-unicode-regexp

  const results: SplitResult[] = [];

  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) != undefined) {
    const [, valueString, unit] = match;
    const normalizedValueString = valueString.replace(',', '.');

    const value = Number.parseFloat(normalizedValueString);
    const result: SplitResult = { value, unitString: unit };

    results.push(result);
  }

  return results;
}

function parseSplit(units: Unit[], splitResult: SplitResult): number {
  for (const unit of units) {
    let matches: boolean;

    if (typeof unit.pattern == 'string') {
      matches = splitResult.unitString == unit.pattern;
    }
    else {
      matches = unit.pattern.test(splitResult.unitString);
    }

    if (matches) {
      const result = splitResult.value * unit.factor;
      return result;
    }
  }

  throw new Error(`no unit for ${splitResult.unitString} available`);
}
