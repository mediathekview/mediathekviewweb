import { SegmentConverter, Segment, SegmentConverterResultArray, SegmentConverterResultType } from '../';
import { Field } from '../../model';
import { QueryBody } from '../../search-engine';
import { TextQueryBuilder } from '../../search-engine/query/builder';
import { SelectorSegmentConverterBase } from './selector-segment-converter-base';

const FIELDS = [Field.Topic, Field.Title];
const SELECTOR_REGEX = /^$/;

export class DefaultSegmentConverter implements SegmentConverter {
  tryConvert(segment: Segment): SegmentConverterResultArray | null {
    const builder = new TextQueryBuilder();
    const query = builder.fields(...FIELDS).text(segment.text).operator('and').build();

    const type = segment.inverted ? SegmentConverterResultType.Exclude : SegmentConverterResultType.Include;

    const result: SegmentConverterResultArray = [{
      fields: FIELDS,
      type: type,
      joinSameFieldsResults: true,
      query: query
    }];

    return result;
  }
}