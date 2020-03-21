import { Segment } from './segment';

const SEGMENTATION_REGEX = /\S*".*?"|\S*"[^"]+|[^\s"]+/ug;
const SEGMENT_PARSE_REGEX = /^(\^|-)?(?:([a-zA-Z]+):|([!#*+]))?(?:["](.+?)["]?|([^ "]+)"?|"{1,2})?$/u; // eslint-disable-line prefer-named-capture-group

export class Segmentizer {
  segmentize(search: string): Segment[] { // eslint-disable-line class-methods-use-this
    const regex = new RegExp(SEGMENTATION_REGEX); // eslint-disable-line require-unicode-regexp
    const segments: Segment[] = [];

    let match: RegExpExecArray | null;
    while ((match = regex.exec(search)) != undefined) {
      const segment = parseSegment(match[0], match.index);
      segments.push(segment);
    }

    return segments;
  }
}

function parseSegment(segmentString: string, index: number): Segment {
  const match = SEGMENT_PARSE_REGEX.exec(segmentString);

  if (match == undefined) {
    throw new Error(`${segmentString} - no match, should not happen`);
  }

  const [, invertedString, selectorA, selectorB, quotedText, nonQuotedText] = match;

  const selector = (selectorA != undefined) ? selectorA : selectorB;

  const inverted = (invertedString != undefined);
  let text = '';
  let isQuote = false;

  if (quotedText != undefined) {
    text = quotedText;
    isQuote = true;
  }
  else if (nonQuotedText != undefined) {
    text = nonQuotedText;
  }

  return new Segment(inverted, text, index, segmentString.length, isQuote, selector);
}
