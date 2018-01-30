const PARSE_REGEX = /^(\d+)(\.\d+(\.\d+)?)?$/;

export class DateParser {
    parse(text: string): Date | null {
        let result: Date | null = null;

        const match = text.match(PARSE_REGEX);

        if (match != null) {
            const now = new Date();
            const [, dayString, monthString, yearString] = match;

            let month = now.getMonth();
            let year = now.getFullYear();

            const day = Number.parseInt(dayString);

            if (monthString != undefined) {
                month = Number.parseInt(monthString);
            }

            if (yearString != undefined) {
                year = Number.parseInt(yearString);
            }

            result = new Date(year, month, day);
        }

        return result;
    }
}