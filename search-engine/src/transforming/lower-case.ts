import { ITransformer } from './';

export class LowerCaseTransformer implements ITransformer {
  transform(text: string): string {
    return text.toLowerCase();
  }
}
