import { Segment } from './segment';

const SEGMENTATION_REGEX = /\S*\".*?\"|\S*\"[^\"]+|[^\s\"]+/g;
const SEGMENT_PARSE_REGEX = /^(\^|-)?(?:([a-zA-Z]+):|([!#*+]))?(?:[\"](.+?)[\"]?|([^ \"]+)\"?|\"{1,2})?$/;

export class Segmentizer {
  segmentize(search: string): Segment[] {
    const regex = new RegExp(SEGMENTATION_REGEX);

    const matches: RegExpExecArray[] = [];

    let match: RegExpExecArray | null;
    while ((match = regex.exec(search)) != null) {
      matches.push(match);
    }

    const segments = matches
      .map((match) => this.parseSegment(match[0], match.index));

    return segments;
  }

  parseSegment(segmentString: string, index: number): Segment {
    const match = segmentString.match(SEGMENT_PARSE_REGEX);

    if (match == null) {
      throw new Error(segmentString + ' - no match, should not happen');
    }

    const [, invertedString, selectorA, selectorB, quotedText, nonQuotedText] = match;

    const selector = (selectorA != undefined) ? selectorA : selectorB;

    const inverted = (invertedString != undefined);
    let text: string = '';
    let isQuote: boolean = false;

    if (quotedText != undefined) {
      text = quotedText;
      isQuote = true;
    } else if (nonQuotedText != undefined) {
      text = nonQuotedText;
    }

    return new Segment(inverted, text, index, segmentString.length, isQuote, selector);
  }
}
