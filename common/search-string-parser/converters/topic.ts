import { Field } from '../../models';
import { SegmentConverter } from '../segment-converter';
import { TextSegmentConverterBase } from './text-base';

const FIELD = Field.Topic;
const SELECTOR_REGEX = /^(?:to(?:p(?:i(?:c)?)?)?|th(?:e(?:m(?:a)?)?)?|#)$/u;

export class TopicSegmentConverter extends TextSegmentConverterBase implements SegmentConverter {
  constructor() {
    super(FIELD, SELECTOR_REGEX);
  }
}
