import { Field } from '../../model';
import { Operator } from '../../search-engine/query';
import { TextQueryBuilder } from '../../search-engine/query/builder';
import { Segment } from '../segment';
import { SegmentConverter, SegmentConverterResultArray, SegmentConverterResultType } from '../segment-converter';

const FIELDS = [Field.Topic, Field.Title];

export class DefaultSegmentConverter implements SegmentConverter {
  tryConvert(segment: Segment): SegmentConverterResultArray | undefined {
    const builder = new TextQueryBuilder();

    const query = builder
      .fields(...FIELDS)
      .text(segment.text)
      .operator(Operator.And)
      .build();

    const type = segment.inverted ? SegmentConverterResultType.Exclude : SegmentConverterResultType.Include;

    const result: SegmentConverterResultArray = [{
      fields: FIELDS,
      type,
      joinSameFieldsResults: !segment.isQuote,
      query
    }];

    return result;
  }
}
