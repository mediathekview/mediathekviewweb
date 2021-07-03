import { Operator } from '../../search-engine/query';
import { RegexQueryBuilder, TextQueryBuilder } from '../../search-engine/query/builder';
import type { Segment } from '../segment';
import { SegmentType } from '../segment';
import type { SegmentConverter, SegmentConverterResult } from '../segment-converter';
import { SelectorSegmentConverterBase } from './selector-segment-converter-base';

export class TextSegmentConverterBase extends SelectorSegmentConverterBase implements SegmentConverter {
  private readonly group?: symbol | string;

  constructor(fieldOrFields: string | string[], selectorRegex: RegExp, group?: symbol | string) {
    super(fieldOrFields, selectorRegex);

    this.group = group;
  }

  protected convert(segment: Segment): SegmentConverterResult | undefined {
    const result: SegmentConverterResult = { group: this.group, should: [] };

    switch (segment.type) {
      case SegmentType.Normal:
      case SegmentType.Quoted:
        result.should!.push(
          new TextQueryBuilder()
            .fields(...this.fields)
            .text(segment.value)
            .operator((segment.type == SegmentType.Quoted) ? 'and' : 'or')
        );

        break;

      case SegmentType.Pattern:
        const regexQueryBuilders = this.fields.map((field) => new RegexQueryBuilder()
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
