import { ITokenFilter } from './';

export class EdgeNGramTokenFilter implements ITokenFilter {
  private minGram: number;
  private maxGram: number;
  private keepOriginal: boolean;
  private keepNumbers: boolean;

  private numberRegex: RegExp = /\d+/;

  constructor(minGram: number = 3, maxGram: number = 20, keepOriginal: boolean = true, keepNumbers: boolean = true) {
    this.minGram = minGram;
    this.maxGram = maxGram;
    this.keepOriginal = keepOriginal;
    this.keepNumbers = keepNumbers;
  }

  filter(tokens: string[]): string[] {
    let out: string[] = [];

    for (let i = 0; i < tokens.length; i++) {
      let token = tokens[i];

      let limit = Math.min(token.length, this.maxGram);
      for (let j = this.minGram; j <= limit; j++) {
        out.push(token.substring(0, j));
      }

      if (this.minGram > token.length && this.keepNumbers) {
        if (this.numberRegex.test(token)) {
          out.push(token);
        }
      }

      if (this.keepOriginal && limit < token.length) {
        out.push(token);
      }
    }

    return out;
  }
}
