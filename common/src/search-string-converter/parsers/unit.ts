const PARSE_REGEX = /(\d+(?:[.,]\d+)?([a-zA-Z]+)?)/;

export type Unit = { pattern: RegExp, factor: number };

type SplitResult = { value: number, unitString: string | null };

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
            const [, valueString, unitMatch] = match;

            const value = Number.parseFloat(valueString);
            const unit = (unitMatch != undefined) ? unitMatch : null;

            const result: SplitResult = { value: value, unitString: unit };

            results.push(result);
        }

        return results;
    }

    private parseSplit(splitResult: SplitResult): number {
        if (splitResult.unitString == null) {
            return 1;
        }

        for (const unit of this.units) {
            const matches = unit.pattern.test(splitResult.unitString);

            if (matches) {
                return unit.factor;
            }
        }

        throw new Error(`no unit for ${splitResult.unitString} available`);
    }
}
