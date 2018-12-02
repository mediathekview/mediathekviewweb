import { Segment, SegmentConverter, SegmentConverterResultArray, SegmentConverterResultType } from '../';
import { QueryBody } from '../../search-engine/query';

export abstract class SelectorSegmentConverterBase implements SegmentConverter {
  private readonly fields: string[];
  private readonly selectorRegex: RegExp;

  constructor(field: string, selectorRegex: RegExp)
  constructor(fields: string[], selectorRegex: RegExp)
  constructor(fieldOrFields: string | string[], selectorRegex: RegExp) {
    this.fields = Array.isArray(fieldOrFields) ? fieldOrFields : [fieldOrFields];
    this.selectorRegex = selectorRegex;
  }

  tryConvert(segment: Segment): SegmentConverterResultArray | null {
    const canHandleSelector = this.canHandleSelector(segment);

    if (!canHandleSelector) {
      return null;
    }

    let result: SegmentConverterResultArray | null = null;
    const query = this.textToQuery(segment.text);

    if (query != null) {
      const type = segment.inverted ? SegmentConverterResultType.Exclude : SegmentConverterResultType.Include;

      result = [{
        fields: this.fields,
        joinSameFieldsResults: false,
        type: type,
        query: query
      }];
    }

    return result;
  }

  private canHandleSelector(segment: Segment): boolean {
    return segment.selector != null && this.selectorRegex.test(segment.selector);
  }

  protected abstract textToQuery(text: string): QueryBody | null;
}
