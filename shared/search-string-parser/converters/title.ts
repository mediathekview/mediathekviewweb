import { fields } from '$shared/models/core';
import type { SegmentConverter } from '../segment-converter';
import { TextSegmentConverterBase } from './text-base';

const field = fields.title;
const selectorRegex = /^(?:ti(?:t(?:(?:l(?:e)?)|(?:e(?:l)?))?)?|\+)$/u;
const groupSymbol = Symbol('title group');

export class TitleSegmentConverter extends TextSegmentConverterBase implements SegmentConverter {
  constructor() {
    super(field, selectorRegex, groupSymbol);
  }
}
