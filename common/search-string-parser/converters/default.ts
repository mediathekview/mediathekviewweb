import { Field } from '../../models';
import { Operator } from '../../search-engine/query';
import { TextQueryBuilder } from '../../search-engine/query/builder';
import { Segment } from '../segment';
import { SegmentConverter, SegmentConverterResultArray, SegmentConverterResultType } from '../segment-converter';

const fields = [Field.Topic, Field.Title];

export class DefaultSegmentConverter implements SegmentConverter {
  // eslint-disable-next-line class-methods-use-this
  tryConvert(segment: Segment): SegmentConverterResultArray | undefined {
    const builder = new TextQueryBuilder();

    const query = builder
      .fields(...fields)
      .text(segment.text)
      .operator(Operator.And)
      .build();

    const type = segment.inverted ? SegmentConverterResultType.Exclude : SegmentConverterResultType.Include;

    const result: SegmentConverterResultArray = [{
      fields,
      type,
      joinSameFieldsResults: !segment.isQuote,
      query
    }];

    return result;
  }
}
