import { SegmentConverter } from '../';
import { Field } from '../../model';
import { QueryBody } from '../../search-engine';
import { TextQueryBuilder } from '../../search-engine/query/builder';
import { SelectorSegmentConverterBase } from './selector-segment-converter-base';

const FIELD = Field.Channel;
const SELECTOR_REGEX = /^(?:c(?:h(?:a(?:n(?:n(?:e(?:l)?)?)?)?)?)?|s(?:e(?:n(?:d(?:e(?:r)?)?)?)?)?|!)$/;

export class ChannelSegmentConverter extends SelectorSegmentConverterBase implements SegmentConverter {
  constructor() {
    super(FIELD,SELECTOR_REGEX);
  }

  protected textToQuery(text: string): QueryBody {
    const builder = new TextQueryBuilder();
    const query = builder.fields(FIELD).text(text).operator('and').build();

    return query;
  }
}