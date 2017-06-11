import { ITokenFilter } from './';
import * as Snowball from 'node-snowball';

export class StemmingTokenFilter implements ITokenFilter {
  private language: string;

  constructor(language: string) {
    this.language = language;
  }

  filter(tokens: string[]): string[] {
    return Snowball.stemword(tokens, this.language);
  }
}
