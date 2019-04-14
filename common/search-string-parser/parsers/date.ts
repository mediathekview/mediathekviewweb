import { isValidDate } from '@common-ts/base/utils';

const PARSE_REGEX = /^(\d{1,2})[\.\-\/]?(?:[\.\-\/](\d{1,2})[\.\-\/]?(?:[\.\-\/](\d{2}|\d{4}))?)?$/;

export class DateParser {
  parse(text: string): Date | undefined {
    const match = text.match(PARSE_REGEX);

    if (match == undefined) {
      return undefined;
    }

    let result: Date | undefined;

    const now = new Date();
    let [, dayString, monthString, yearString] = match; // tslint:disable-line: prefer-const

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

    const isValid = isValidDate(year, month, day);

    if (isValid) {
      result = new Date(year, month, day);
    }

    return result;
  }
}
