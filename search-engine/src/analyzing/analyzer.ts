import { ITransformer } from './transforming';
import { ITokenizer } from './tokenizing';
import { ITokenFilter } from './tokenizing/filtering';

export interface IAnalyzer {
  analyze(text: string): string[];
}

export class Analyzer implements IAnalyzer {
  transformers: ITransformer[] = [];
  tokenizer: ITokenizer;

  constructor(tokenizer: ITokenizer) {
    this.tokenizer = tokenizer;
  }

  addTransformer(...transformers: ITransformer[]): Analyzer {
    this.transformers = this.transformers.concat(transformers);
    return this;
  }

  analyze(text: string): string[] {
    for (let i = 0; i < this.transformers.length; i++) {
      text = this.transformers[i].transform(text);
    }

    return this.tokenizer.tokenize(text);
  }
}

export class NoopAnalyzer implements IAnalyzer {
  analyze(text: string): string[] {
    return [text];
  }
}
