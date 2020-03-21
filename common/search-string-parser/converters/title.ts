import { Field } from '../../models';
import { Operator, QueryBody } from '../../search-engine/query';
import { TextQueryBuilder } from '../../search-engine/query/builder';
import { SegmentConverter } from '../segment-converter';
import { SelectorSegmentConverterBase } from './selector-segment-converter-base';

const FIELD = Field.Title;
const SELECTOR_REGEX = /^(?:ti(?:t(?:(?:l(?:e)?)|(?:e(?:l)?))?)?|\+)$/u;

export class TitleSegmentConverter extends SelectorSegmentConverterBase implements SegmentConverter {
  constructor() {
    super(FIELD, SELECTOR_REGEX);
  }

  // eslint-disable-next-line class-methods-use-this
  protected textToQuery(text: string): QueryBody {
    const builder = new TextQueryBuilder();

    const query = builder
      .fields(FIELD)
      .text(text)
      .operator(Operator.And)
      .build();

    return query;
  }
}
