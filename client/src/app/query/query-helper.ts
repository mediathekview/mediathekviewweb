import { Match, IFilter, Field, RangeFilter } from '../model';

export class QueryHelper {
  static createMatches(text: string, everywhere: boolean): Match[] {
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
      fields: everywhere ? [Field.Channel, Field.Topic, Field.Title, Field.Description] : [Field.Topic, Field.Title],
      text: generics.join(' ')
    });

    return matches;
  }


  static createFilters(future: boolean): IFilter[] {
    if (!future == true) {
      return null;
    }

    let rangeFilter: RangeFilter = { field: Field.Timestamp, lte: Math.floor(Date.now() / 1000) };

    return [rangeFilter];
  }
}
