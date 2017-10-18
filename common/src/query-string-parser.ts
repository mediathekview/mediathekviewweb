import { IQuery, TextQueryBuilder, RegexQueryBuilder, BoolQueryBuilder, RangeQueryBuilder, MatchAllQueryBuilder, IQueryBuilder } from './search-engine';

const QUOTE_CHARS: string[] = ['"', '/'];
const QUOTE_ESCAPE_CHARS: string[] = ['\\'];

export class QueryStringParser {
  static parse(queryString: string) {
    const segments = this.segmentize(queryString);
    console.log(segments);
  }

  private static segmentize(queryString: string): string[] {
    queryString = queryString.trim();

    const segments: string[] = [];

    for (let i = 0; i < queryString.length; i++) {
      let segment = '';
      let lastChar: string | null = null;
      let quoteChar: string | null = null;

      for (; (queryString[i] != ' ' || quoteChar != null) && i < queryString.length; i++) {
        const char = queryString[i];
        segment += char;

        if (QUOTE_CHARS.includes(char) && !QUOTE_ESCAPE_CHARS.includes(queryString[i - 1])) {
          console.log(queryString[i - 1])
          if (char == quoteChar) {
            break;
          }

          if (quoteChar == null) {
            quoteChar = char;
          }
        }

        lastChar = char;
      }

      if (segment.length > 0) {
        segments.push(segment);
      }
    }

    return segments;
  }

  private static segmentToQueryBuilder(segment: string) {
    const selectors: string[] = ['!', '+', '#', '*', 'd:', 't:'];
  }
}

QueryStringParser.parse('!ard #rot +"hallo  \\"welt\\""');
