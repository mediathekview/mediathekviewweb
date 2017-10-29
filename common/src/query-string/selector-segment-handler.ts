import { Query, MATCH_ALL_QUERY } from '../search-engine';
import { SegmentHandler } from './segment-handler';

export abstract class SelectorSegmentHandler extends SegmentHandler {
  protected abstract _selectorValueRegex: RegExp; //group 1 must be selector, group 2 value
  protected abstract _canHandleSelector(selector: string): boolean;
  protected abstract _validate(value: string): boolean;
  protected abstract __buildQuery(value: string): Query;

  canHandle(text: string): boolean {
    const selector = this.getSelector(text);

    if (selector != null) {
      return this._canHandleSelector(selector);
    }

    return false;
  }

  validate(text: string): boolean {
    const value = this.getValue(text);

    if (value != null) {
      return this._validate(value);
    }

    return false;
  }

  protected _buildQuery(text: string): Query {
    const value = this.getValue(text);

    if (value != null) {
      return this.__buildQuery(value);
    }

    return MATCH_ALL_QUERY;
  }

  private getSelector(text: string): string | null {
    const selectorValue = this.getSelectorValueTuple(text);
    const selector = selectorValue[0];

    return selector;
  }

  private getValue(text: string): string | null {
    const selectorValue = this.getSelectorValueTuple(text);
    const value = selectorValue[1];

    return value;
  }

  private getSelectorValueTuple(text: string): [string | null, string | null] {
    const match = text.match(this._selectorValueRegex);

    if (match == null) {
      return [null, null];
    }

    const selectorGroup = match[1];
    const valueGroup = match[2];

    let selector: string | null = null;
    let value: string | null = null;

    if (selectorGroup != undefined && selectorGroup.length > 0) {
      selector = selectorGroup;
    }
    if (valueGroup != undefined && valueGroup.length > 0) {
      value = valueGroup;
    }

    return [selector, value];
  }
}
