import { ITokenizer, TokenizerBase } from './';

export class WordTokenizer extends TokenizerBase implements ITokenizer {
  private splitRegex: RegExp = /[^\w\döäü']/;

  tokenize(text: string): string[] {
    let tokens = text.split(this.splitRegex);

    let filteredTokens: string[] = [];
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].length > 0) {
        filteredTokens.push(tokens[i]);
      }
    }

    return super.applyFilters(filteredTokens);
  }
}
