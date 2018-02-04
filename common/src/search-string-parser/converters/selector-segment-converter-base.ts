import { SegmentConverter, SegmentConverterResultArray, Segment, SegmentConverterResultType as SegmentType } from '../';
import { QueryBody } from '../../search-engine/query';

export abstract class SelectorSegmentConverterBase implements SegmentConverter {
  private readonly field: string;
  private readonly selectorRegex: RegExp;

  constructor(field: string, selectorRegex: RegExp) {
    this.field = field;
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
      const type = segment.inverted ? SegmentType.Exclude : SegmentType.Include;

      result = [{
        field: this.field,
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