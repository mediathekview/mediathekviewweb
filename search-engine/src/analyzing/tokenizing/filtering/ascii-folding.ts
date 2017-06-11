import { ITokenFilter } from './';
import { ASCIIFoldingTransformer } from '../../transforming/ascii-folding';

export class ASCIIFoldingTokenFilter implements ITokenFilter {
  private keepOriginal: boolean;
  private asciiFoldingTransformer: ASCIIFoldingTransformer;

  constructor(keepOriginal: boolean = true) {
    this.keepOriginal = keepOriginal;
    this.asciiFoldingTransformer = new ASCIIFoldingTransformer();
  }

  filter(tokens: string[]): string[] {
    let out: string[] = [];

    for (let i = 0; i < tokens.length; i++) {
      let token = tokens[i];

      let folded = this.asciiFoldingTransformer.transform(token);
      out.push(folded);

      if (this.keepOriginal && token != folded) {
        out.push(token);
      }
    }

    return out;
  }
}
