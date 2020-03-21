import { QueryBody } from '../../search-engine/query';
import { Segment } from '../segment';
import { SegmentConverter, SegmentConverterResultArray, SegmentConverterResultType } from '../segment-converter';

export abstract class SelectorSegmentConverterBase implements SegmentConverter {
  private readonly fields: string[];
  private readonly selectorRegex: RegExp;

  constructor(fieldOrFields: string | string[], selectorRegex: RegExp) {
    this.fields = Array.isArray(fieldOrFields) ? fieldOrFields : [fieldOrFields];
    this.selectorRegex = selectorRegex;
  }

  tryConvert(segment: Segment): SegmentConverterResultArray | undefined {
    const canHandleSelector = this.canHandleSelector(segment);

    if (!canHandleSelector) {
      return undefined;
    }

    let result: SegmentConverterResultArray | undefined;
    const query = this.textToQuery(segment.text);

    if (query != undefined) {
      const type = segment.inverted ? SegmentConverterResultType.Exclude : SegmentConverterResultType.Include;

      result = [{
        fields: this.fields,
        joinSameFieldsResults: false,
        type,
        query
      }];
    }

    return result;
  }

  private canHandleSelector(segment: Segment): boolean {
    return (segment.selector != undefined) && this.selectorRegex.test(segment.selector);
  }

  protected abstract textToQuery(text: string): QueryBody | undefined;
}
