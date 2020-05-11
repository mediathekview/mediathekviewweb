import { Field } from '../../models';
import { Segment } from '../segment';
import { SegmentConverter, SegmentConverterResult } from '../segment-converter';

export abstract class SelectorSegmentConverterBase implements SegmentConverter {
  protected readonly fields: Field[];
  protected readonly selectorRegex: RegExp;

  constructor(fieldOrFields: Field | Field[], selectorRegex: RegExp) {
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

  protected abstract convert(segment: Segment): SegmentConverterResult | undefined;

  private canHandleSelector(segment: Segment): boolean {
    return (segment.selector != undefined) && this.selectorRegex.test(segment.selector);
  }
}
