const PARSE_REGEX = /(\d+(?:[.,]\d+)?)([a-zA-Z]*)/g;

export type Unit = { pattern: string | RegExp, factor: number };

type SplitResult = { value: number, unitString: string };

export class UnitParser {
  private readonly units: Unit[];

  constructor(units: Unit[]) {
    this.units = units;
  }

  parse(text: string): number {
    let total = 0;

    const splits = this.split(text);

    for (const split of splits) {
      total += this.parseSplit(split);
    }

    return total;
  }

  private split(text: string): SplitResult[] {
    const regex = new RegExp(PARSE_REGEX);

    const results: SplitResult[] = [];

    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) != null) {
      const [, valueString, unit] = match;
      const normalizedValueString = valueString.replace(',', '.');
      
      const value = Number.parseFloat(normalizedValueString);
      const result: SplitResult = { value: value, unitString: unit };

      results.push(result);
    }

    return results;
  }

  private parseSplit(splitResult: SplitResult): number {
    for (const unit of this.units) {
      let matches: boolean;

      if (typeof unit.pattern == 'string') {
        matches = splitResult.unitString == unit.pattern;
      } else {
        matches = unit.pattern.test(splitResult.unitString);
      }

      if (matches) {
        const result = splitResult.value * unit.factor;
        return result;
      }
    }

    throw new Error(`no unit for ${splitResult.unitString} available`);
  }
}
