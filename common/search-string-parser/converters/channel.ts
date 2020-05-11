import { Field } from '../../models';
import { SegmentConverter } from '../segment-converter';
import { TextSegmentConverterBase } from './text-base';

const FIELD = Field.Channel;
const SELECTOR_REGEX = /^(?:c(?:h(?:a(?:n(?:n(?:e(?:l)?)?)?)?)?)?|s(?:e(?:n(?:d(?:e(?:r)?)?)?)?)?|!)$/u;

export class ChannelSegmentConverter extends TextSegmentConverterBase implements SegmentConverter {
  constructor() {
    super(FIELD, SELECTOR_REGEX);
  }
}
