import { isDefined } from '@tstdl/base/utils';
import type { Segment } from '../segment';
import type { SegmentConverter, SegmentConverterResult } from '../segment-converter';

export abstract class SelectorSegmentConverterBase implements SegmentConverter {
  protected readonly fields: string[];
  protected readonly selectorRegex: RegExp;

  constructor(fieldOrFields: string | string[], selectorRegex: RegExp) {
    this.fields = Array.isArray(fieldOrFields) ? fieldOrFields : [fieldOrFields];
    this.selectorRegex = selectorRegex;
  }

  tryConvert(segment: Segment): SegmentConverterResult | undefined {
    const canHandleSelector = this.canHandleSelector(segment);

    if (!canHandleSelector) {
      return undefined;
    }

    return this.convert(segment);
  }

  private canHandleSelector(segment: Segment): boolean {
    return isDefined(segment.selector) && this.selectorRegex.test(segment.selector);
  }

  protected abstract convert(segment: Segment): SegmentConverterResult | undefined;
}
