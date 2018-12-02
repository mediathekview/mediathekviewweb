const SEGMENT_PARSE_REGEX = /^(\^|-)?(?:([a-zA-Z]+):|([!#*+]))?(?:[\"](.+?)[\"]?|([^ \"]+)\"?|\"{1,2})?$/;

export class Segment {
  readonly inverted: boolean;
  readonly selector: string | null;
  readonly text: string;
  readonly isQuote: boolean;

  constructor(inverted: boolean, text: string, isQuote: boolean);
  constructor(inverted: boolean, text: string, isQuote: boolean, selector: string);
  constructor(inverted: boolean, text: string, isQuote: boolean, selector?: string) {
    this.inverted = inverted;
    this.text = text;
    this.isQuote = isQuote;
    this.selector = (selector == undefined) ? null : selector;
  }

  static fromString(segmentString: string): Segment {
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

    return new Segment(inverted, text, isQuote, selector);
  }
}
