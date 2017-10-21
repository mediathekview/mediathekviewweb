import { IQuery, TextQueryBuilder, RegexQueryBuilder, BoolQueryBuilder, RangeQueryBuilder, MatchAllQueryBuilder, IQueryBuilder } from '../search-engine';
import { Field } from '../model';
import { Segment, QUOTE_CHARS, ESCAPE_CHAR, REGEX_CHAR } from './definitions';

//TODO use segment-converters

export class QueryStringParser {
  static parse(queryString: string): IQuery {
    const segments = this.segmentize(queryString);
    const query = this.queryize(segments);
    return query;
  }

  private static queryize(segments: Segment[]): IQuery {
    const outerBoolQuery = new BoolQueryBuilder();

    for (const segment of segments) {
      switch (segment.selector) {
        case '!':
          const channelQuery = this.textToQueryBuilder(Field.Channel, segment.text, segment.regex);
          outerBoolQuery.must(channelQuery);
          break;

        case '#':
          let topicQuery = this.textToQueryBuilder(Field.Topic, segment.text, segment.regex);
          outerBoolQuery.must(topicQuery);
          break;

        case '+':
          let titleQuery = this.textToQueryBuilder(Field.Title, segment.text, segment.regex);
          outerBoolQuery.must(titleQuery);
          break;

        case '*':
          let descriptionQuery = this.textToQueryBuilder(Field.Description, segment.text, segment.regex);
          outerBoolQuery.must(descriptionQuery);
          break;

        case '!':

          break;

        case null:
          break;

        default:
          throw new Error(`parser for selector ${segment.selector} not implemented`);
      }
    }

    const query = outerBoolQuery.build();
    return query;
  }

  private static textToQueryBuilder(fields: string, text: string, regex: boolean): IQueryBuilder {
    let queryBuilder: IQueryBuilder;

    if (regex) {
      const regexQueryBuilder = queryBuilder = new RegexQueryBuilder();
      regexQueryBuilder.fields(fields).expression(text).operator('or');
    } else {
      const textQueryBuilder = queryBuilder = new TextQueryBuilder();
      textQueryBuilder.fields(fields).text(text).operator('and');
    }

    return queryBuilder;
  }

  private static segmentize(queryString: string): Segment[] {
    queryString = queryString.trim();

    const segments: Segment[] = [];

    for (let i = 0; i < queryString.length; i++) {
      const segment: Segment = { selector: null, text: '', regex: false };
      let segmentQuoteChar: string | null = null;

      let lastChar: string | null = null;
      for (; (queryString[i] != ' ' || segmentQuoteChar != null) && i < queryString.length; i++) {
        const char = queryString[i];

        const isQuoteChar = (QUOTE_CHARS.includes(char)) && (lastChar == null || lastChar != ESCAPE_CHAR);

        if (isQuoteChar && (segmentQuoteChar == null || char == segmentQuoteChar)) {
          if (segmentQuoteChar != null) {
            break;
          }
          else {
            segmentQuoteChar = char;
            if (char == REGEX_CHAR) {
              segment.regex = true;
            }
          }
        }
        else {
          segment.text += char;
        }

        lastChar = char;
      }

      if (segment.text.length > 0) {
        segments.push(segment);
      }
    }

    for (const segment of segments) {
      for (const selector in Selector) {
        if (segment.text.startsWith(selector)) {
          segment.selector = selector as Selector;
          segment.text = segment.text.slice(selector.length);
          break;
        }
      }
    }

    return segments;
  }
}
