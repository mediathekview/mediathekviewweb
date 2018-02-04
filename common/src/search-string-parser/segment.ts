const SEGMENT_PARSE_REGEX = /^(\^)?(?:([a-zA-Z]+):|([!#*+]))?(?:[\""](.+?)[\""]|([^ ]+))$/;

export class Segment {
  readonly inverted: boolean;
  readonly selector: string | null;
  readonly text: string;

  constructor(inverted: boolean, text: string);
  constructor(inverted: boolean, text: string, selector: string);
  constructor(inverted: boolean, text: string, selector?: string) {
    this.inverted = inverted;
    this.text = text;
    this.selector = (selector == undefined) ? null : selector;
  }

  static fromString(segmentString: string): Segment {
    const match = segmentString.match(SEGMENT_PARSE_REGEX);
    const [, invertedString, selectorA, selectorB, quotedText, nonQuotedText] = match;

    const selector = (selectorA != undefined) ? selectorA : selectorB;

    const inverted = (invertedString != undefined);
    let text: string;

    if (quotedText != undefined) {
      text = quotedText;
    } else if (nonQuotedText != undefined) {
      text = nonQuotedText;
    } else {
      throw new Error('should not happen');
    }

    return new Segment(inverted, text, selector);
  }
}