import { Field } from '../../models';
import { SegmentConverter } from '../segment-converter';
import { TextSegmentConverterBase } from './text-base';

const FIELD = Field.Description;
const SELECTOR_REGEX = /^(?:de(?:s(?:c(?:r(?:i(?:p(?:t(?:i(?:o(?:n)?)?)?)?)?)?)?)?)?|b(?:e(?:s(?:c(?:h(?:r(?:e(?:i(?:b(?:u(?:n(?:g)?)?)?)?)?)?)?)?)?)?)?|\*)$/u;

export class DescriptionSegmentConverter extends TextSegmentConverterBase implements SegmentConverter {
  constructor() {
    super(FIELD, SELECTOR_REGEX);
  }
}
