import { Field } from '../../models';
import { SegmentConverter } from '../segment-converter';
import { TextSegmentConverterBase } from './text-base';

const fields = [Field.Topic, Field.Title];
const selectorRegex = /^_NONE_$/;

export class DefaultSegmentConverter extends TextSegmentConverterBase implements SegmentConverter {
  constructor() {
    super(fields, selectorRegex);
  }
}
