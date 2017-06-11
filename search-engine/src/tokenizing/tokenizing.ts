import { ITokenFilter } from './filtering';

export interface ITokenizer {
  tokenize(text: string): string[];
  addFilter(filter: ITokenFilter): ITokenizer;
}

export abstract class TokenizerBase implements ITokenizer {
  private filters: ITokenFilter[] = [];

  abstract tokenize(text: string): string[];

  addFilter(filter: ITokenFilter): ITokenizer {
    this.filters.push(filter);
    return this;
  }

  applyFilters(tokens: string[]): string[] {
    for (let i = 0; i < this.filters.length; i++) {
      tokens = this.filters[i].filter(tokens);
    }

    let tokenSet = new Set<string>(tokens);
    let uniqueTokens = Array.from(tokenSet);

    return uniqueTokens;
  }
}
