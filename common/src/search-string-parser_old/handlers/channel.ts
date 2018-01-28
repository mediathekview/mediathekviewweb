import { QueryBody, TextQueryBuilder } from '../../search-engine';
import { Field } from '../../model';
import { ColonDelimitedSelectorSegmentHandler } from '../colon-delimited-selector-segment-handler';

export class ChannelSegmentHandler extends ColonDelimitedSelectorSegmentHandler {
  protected _selectorValidationRegex = /^ch?a?n?n?e?l?$/;

  protected _validate(text: string): boolean {
    return true;
  }

  protected __buildQuery(value: string): QueryBody {
    const builder = new TextQueryBuilder();
    builder.fields(Field.Channel).operator('and').text(value);

    const query = builder.build();
    return query;
  }
}

const channelSegmentHandler = new ChannelSegmentHandler();

console.log(channelSegmentHandler.canHandle('c:123'));
console.log(channelSegmentHandler.validate('c:123'));
console.log(channelSegmentHandler.buildQuery('c:123'));
