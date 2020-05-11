import { Field } from '../../models';
import { SegmentConverter } from '../segment-converter';
import { TextSegmentConverterBase } from './text-base';

const FIELD = Field.Title;
const SELECTOR_REGEX = /^(?:ti(?:t(?:(?:l(?:e)?)|(?:e(?:l)?))?)?|\+)$/u;

export class TitleSegmentConverter extends TextSegmentConverterBase implements SegmentConverter {
  constructor() {
    super(FIELD, SELECTOR_REGEX);
  }
}
