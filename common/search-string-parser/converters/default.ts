import { Segment, SegmentConverter, SegmentConverterResultArray, SegmentConverterResultType } from '../';
import { Field } from '../../model';
import { Operator } from '../../search-engine';
import { TextQueryBuilder } from '../../search-engine/query/builder';

const FIELDS = [Field.Topic, Field.Title];
const SELECTOR_REGEX = /^$/;

export class DefaultSegmentConverter implements SegmentConverter {
  tryConvert(segment: Segment): SegmentConverterResultArray | null {
    const builder = new TextQueryBuilder();
    const query = builder.fields(...FIELDS).text(segment.text).operator(Operator.And).build();

    const type = segment.inverted ? SegmentConverterResultType.Exclude : SegmentConverterResultType.Include;

    const result: SegmentConverterResultArray = [{
      fields: FIELDS,
      type: type,
      joinSameFieldsResults: !segment.isQuote,
      query: query
    }];

    return result;
  }
}
