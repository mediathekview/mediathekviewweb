import { Field } from '../../models';
import { Operator } from '../../search-engine/query';
import { RegexQueryBuilder, TextQueryBuilder } from '../../search-engine/query/builder';
import { Segment, SegmentType } from '../segment';
import { SegmentConverter, SegmentConverterResult } from '../segment-converter';
import { SelectorSegmentConverterBase } from './selector-segment-converter-base';

export class TextSegmentConverterBase extends SelectorSegmentConverterBase implements SegmentConverter {
  constructor(fieldOrFields: Field | Field[], selectorRegex: RegExp) {
    super(fieldOrFields, selectorRegex);
  }

  protected convert(segment: Segment): SegmentConverterResult | undefined {
    const result: SegmentConverterResult = { should: [] };

    switch (segment.type) {
      case SegmentType.Normal:
      case SegmentType.Quoted:
        result.should!.push(
          new TextQueryBuilder()
            .fields(...this.fields)
            .text(segment.value)
            .operator((segment.type == SegmentType.Quoted) ? Operator.And : Operator.Or)
        );

        break;

      case SegmentType.Pattern:
        const regexQueryBuilders = this.fields.map((field) =>
          new RegexQueryBuilder()
            .field(field)
            .expression(segment.value)
        );

        result.should!.push(...regexQueryBuilders);

        break;

      default:
        throw new Error('unsupported SegmentType');
    }

    return result;
  }
}
