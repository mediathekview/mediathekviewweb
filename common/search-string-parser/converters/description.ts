import { Field } from '../../models';
import { Operator, QueryBody } from '../../search-engine/query';
import { TextQueryBuilder } from '../../search-engine/query/builder';
import { SegmentConverter } from '../segment-converter';
import { SelectorSegmentConverterBase } from './selector-segment-converter-base';

const FIELD = Field.Description;
const SELECTOR_REGEX = /^(?:de(?:s(?:c(?:r(?:i(?:p(?:t(?:i(?:o(?:n)?)?)?)?)?)?)?)?)?|b(?:e(?:s(?:c(?:h(?:r(?:e(?:i(?:b(?:u(?:n(?:g)?)?)?)?)?)?)?)?)?)?)?|\*)$/;

export class DescriptionSegmentConverter extends SelectorSegmentConverterBase implements SegmentConverter {
  constructor() {
    super(FIELD, SELECTOR_REGEX);
  }

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
