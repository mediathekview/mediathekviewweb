import { ITokenFilter } from './';

export class EdgeNGramTokenFilter implements ITokenFilter {
  private minGram: number;
  private maxGram: number;
  private keepOriginal: boolean;

  constructor(minGram: number = 1, maxGram: number = 20, keepOriginal: boolean = true) {
    this.minGram = minGram;
    this.maxGram = maxGram;
    this.keepOriginal = keepOriginal;
  }

  filter(tokens: string[]): string[] {
    let out: string[] = [];

    for (let i = 0; i < tokens.length; i++) {
      let token = tokens[i];

      let limit = Math.min(token.length, this.maxGram);
      for (let j = this.minGram; j <= limit; j++) {
        out.push(token.substring(0, j));
      }

      if (this.keepOriginal && limit < token.length) {
        out.push(token);
      }
    }

    return out;
  }
}
