import { Match, IFilter, Field, RangeFilter } from '../../model';
import { SettingsObject } from '../../settings';

const DURATION_REGEX = /([\d,\.]+)\s*([A-Za-z]*)/g;

const SECOND = 1;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;

const TIME_UNITS: { regex: RegExp, seconds: number }[] = [
  { regex: /^(h|st)/, seconds: HOUR },
  { regex: /^m/, seconds: MINUTE },
  { regex: /^(s$|s[^t])/, seconds: SECOND }
]

export class QueryHelper {
  static createMatches(text: string, settings: SettingsObject): Match[] {
    let matches: Match[] = [];

    let textSplits = text.split(/\s/).filter((s) => s.length > 0);

    let generics: string[] = [];

    for (let i = 0; i < textSplits.length; i++) {
      let split = textSplits[i];

      let selector: string = null;
      let text: string = null;
      let fields: string[] = [];

      let selectorMatch = split.match(/(!|#|\+|\*)/);
      if (selectorMatch != null) {
        selector = selectorMatch[0];
      }

      let textMatch = split.match(/([^!#*+](.*))/);
      if (textMatch != null) {
        text = textMatch[0].split(',').filter(s => s.length > 0).join(' ');
      }

      switch (selector) {
        case '!':
          fields = [Field.Channel];
          break;

        case '#':
          fields = [Field.Topic];
          break;

        case '+':
          fields = [Field.Title];
          break;

        case '*':
          fields = [Field.Description];
          break;
      }

      if (selector != null) {
        matches.push({
          fields: fields,
          text: text
        });
      } else {
        generics.push(text);
      }
    }

    matches.push({
      fields: settings.everywhere ? [Field.Channel, Field.Topic, Field.Title, Field.Description] : [Field.Topic, Field.Title],
      text: generics.join(' ')
    });

    return matches;
  }


  static createFilters(settings: SettingsObject): IFilter[] {
    let filters: IFilter[] = [];

    if (!settings.future == false) {
      let timestampFilter: RangeFilter = { field: Field.Timestamp, lte: Math.floor(Date.now() / 1000) };
      filters.push(timestampFilter);
    }

    let minDuration = this.parseDuration(settings.minDurationString);
    let maxDuration = this.parseDuration(settings.maxDurationString);

    if (minDuration > 0 || maxDuration > 0) {
      let durationFilter: RangeFilter = { field: Field.Duration };

      if (minDuration > 0) {
        durationFilter.gte = minDuration;
      }
      if (maxDuration > 0) {
        durationFilter.lte = maxDuration;
      }

      filters.push(durationFilter);
    }

    return filters;
  }

  static parseDuration(durationString: string): number {
    if (durationString.length == 0) return 0;

    let durationRegex = new RegExp(DURATION_REGEX);

    let seconds = 0;

    let result: RegExpExecArray;
    while ((result = durationRegex.exec(durationString)) !== null) {
      let value = parseFloat(result[1]);
      let unit = result[2].toLowerCase();

      seconds += value * this.getTimeUnitSeconds(unit);
    }

    return Math.floor(seconds);
  }

  private static getTimeUnitSeconds(unitString: string): number {
    if (unitString.length == 0) {
      return MINUTE;
    }

    for (let i = 0; i < TIME_UNITS.length; i++) {
      let timeUnit = TIME_UNITS[i];

      if (timeUnit.regex.test(unitString) == true) {
        return timeUnit.seconds;
      }
    }

    return 0;
  }
}
