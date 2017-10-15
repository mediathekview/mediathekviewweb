import { IQuery, TextQueryBuilder, RegexQueryBuilder, BoolQueryBuilder, RangeQueryBuilder, MatchAllQueryBuilder, IQueryBuilder } from './';

export interface SegmentParser {
  canParse(segment: Segment): boolean;
  parse(segment: Segment): IQuery;
}

export abstract class StringSegmentParserBase implements SegmentStringParser {
  abstract canParse(segment: Segment): boolean;
  abstract parse(segment: Segment): IQuery;

  protected parseToQueryBuilder(segment: Segment, ...fields: string[]): IQuery {
    let text: string;

    if (segment.quoteChar == null) {
      text = segment.segmentString;
    } else {
      text = segment.segmentString.slice(1, -1);
    }

    let queryBuilder: TextQueryBuilder | BoolQueryBuilder | RegexQueryBuilder | null = null;

    switch (segment.quoteChar) {
      case null:
      case '"':
        queryBuilder = new TextQueryBuilder();
        queryBuilder.fields(...fields).text(text);
        break;

      case '/':
        if (fields.length == 1) {
          queryBuilder = new RegexQueryBuilder();
          queryBuilder.field(fields[0]).expression(text);
        }
        else if (fields.length > 1) {
          queryBuilder = new BoolQueryBuilder();

          for (let field of fields) {
            const regexQueryBuilder = new RegexQueryBuilder();
            regexQueryBuilder.field(field).expression(text);

            queryBuilder.should(regexQueryBuilder);
          }
        }
        break;

      default:
        throw new Error();
    }

    return queryBuilder.build();
  }
}

export class ChannelSegmentParser extends StringSegmentParserBase implements SegmentStringParser {
  canParse(segmentString: string): boolean {
    return segmentString.startsWith('!');
  }

  parse(segmentString: string): IQuery {

  }
}

export class Segment {
  segmentString: string = '';
  quoteChar: string | null = null;
}

export class QueryStringParser {
  static parse(queryString: string, quoteChars: string[], quoteEscapeChars: string[]) {
    const segments = this.segmentize(queryString, quoteChars, quoteEscapeChars);


  }

  private static segmentize(queryString: string, quoteChars: string[], quoteEscapeChars: string[]): Segment[] {
    queryString = queryString.trim();

    const segments: Segment[] = [];

    let segment: Segment;
    for (let i = 0; i < queryString.length; i++) {
      segment = new Segment();

      for (; (queryString[i] != ' ' || segment.quoteChar != null) && i < queryString.length; i++) {
        const char = queryString[i];
        segment.segmentString += char;

        if (char == segment.quoteChar && !quoteEscapeChars.includes(queryString[i - 1])) {
          if (segment.quoteChar != null) {
            segment.quoteChar = null;
            break;
          }
          else if (quoteChars.includes(char)) {
            segment.quoteChar = char;
          }
        }
      }

      if (segment.segmentString.length > 0) {
        segments.push(segment);
      }
    }

    return segments;
  }
}
