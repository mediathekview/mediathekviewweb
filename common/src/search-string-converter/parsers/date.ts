import '../../extensions/date';

const PARSE_REGEX = /^(\d{1,2})[\.\-\/]?(?:[\.\-\/](\d{1,2})[\.\-\/]?(?:[\.\-\/](\d{2}|\d{4}))?)?$/;

export class DateParser {
  parse(text: string): Date | null {
    let result: Date | null = null;

    const match = text.match(PARSE_REGEX);

    if (match != null) {
      const now = new Date();
      let [, dayString, monthString, yearString] = match;

      let month = now.getMonth();
      let year = now.getFullYear();

      const day = Number.parseInt(dayString);

      if (monthString != undefined) {
        month = Number.parseInt(monthString) - 1;
      }

      if (yearString != undefined) {
        if (yearString.length == 2) {
          const hundreds = now.getFullYear().toString().slice(0, -2);
          yearString = hundreds + yearString;
        }
        
        year = Number.parseInt(yearString);
      }

      const isValid = Date.isValid(year, month, day);

      if (isValid) {
        result = new Date(year, month, day);
      }
    }

    return result;
  }
}