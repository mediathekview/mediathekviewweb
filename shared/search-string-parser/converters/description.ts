import { fields } from '$shared/models/core';
import type { SegmentConverter } from '../segment-converter';
import { TextSegmentConverterBase } from './text-base';

const field = fields.description;
const selectorRegex = /^(?:de(?:s(?:c(?:r(?:i(?:p(?:t(?:i(?:o(?:n)?)?)?)?)?)?)?)?)?|b(?:e(?:s(?:c(?:h(?:r(?:e(?:i(?:b(?:u(?:n(?:g)?)?)?)?)?)?)?)?)?)?)?|\*)$/u;
const groupSymbol = Symbol('description group');

export class DescriptionSegmentConverter extends TextSegmentConverterBase implements SegmentConverter {
  constructor() {
    super(field, selectorRegex, groupSymbol);
  }
}
