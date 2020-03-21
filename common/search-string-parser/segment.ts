export class Segment {
  readonly inverted: boolean;
  readonly selector: string | null;
  readonly text: string;
  readonly sourceIndex: number;
  readonly sourceLength: number;
  readonly isQuote: boolean;

  constructor(inverted: boolean, text: string, sourceIndex: number, sourceLength: number, isQuote: boolean, selector?: string) {
    this.inverted = inverted;
    this.text = text;
    this.sourceIndex = sourceIndex;
    this.sourceLength = sourceLength;
    this.isQuote = isQuote;
    this.selector = (selector == undefined) ? null : selector;
  }
}
