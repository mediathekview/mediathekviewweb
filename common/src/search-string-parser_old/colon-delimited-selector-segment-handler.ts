import { SelectorSegmentHandler } from './selector-segment-handler';

export abstract class ColonDelimitedSelectorSegmentHandler extends SelectorSegmentHandler {
  protected _selectorValueRegex = /([a-zA-Z]):(.+)?/;

  protected abstract _selectorValidationRegex: RegExp;

  protected _canHandleSelector(selector: string): boolean {
    return this._selectorValidationRegex.test(selector);
  }
}
