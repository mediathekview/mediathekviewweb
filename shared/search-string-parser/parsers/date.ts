import { DateTime } from 'luxon';

// eslint-disable-next-line prefer-named-capture-group
const PARSE_REGEX = /^(\d{1,2})[.-/]?(?:[.-/](\d{1,2})[.-/]?(?:[.-/](\d{2}|\d{4}))?)?$/u;

export class DateParser {
  // eslint-disable-next-line max-statements, class-methods-use-this
  parse(text: string): Date | undefined {
    const match = PARSE_REGEX.exec(text);

    if (match == undefined) {
      return undefined;
    }

    let result: Date | undefined;

    const now = new Date();
    let [, dayString, monthString, yearString] = match; // eslint-disable-line prefer-const

    let month = now.getMonth();
    let year = now.getFullYear();

    const day = parseInt(dayString!, 10);

    if (monthString != undefined) {
      month = parseInt(monthString, 10) - 1;
    }

    if (yearString != undefined) {
      if (yearString.length == 2) {
        const hundreds = now.getFullYear()
          .toString()
          .slice(0, -2);

        yearString = hundreds + yearString;
      }

      year = parseInt(yearString, 10);
    }

    const isValid = DateTime.fromObject({ year, month, day }).isValid;

    if (isValid) {
      result = new Date(year, month, day);
    }

    return result;
  }
}
