import { fields } from '$shared/models/core';
import type { SegmentConverter } from '../segment-converter';
import { TextSegmentConverterBase } from './text-base';

const field = fields.topic;
const selectorRegex = /^(?:to(?:p(?:i(?:c)?)?)?|th(?:e(?:m(?:a)?)?)?|#)$/u;
const groupSymbol = Symbol('segment group');

export class TopicSegmentConverter extends TextSegmentConverterBase implements SegmentConverter {
  constructor() {
    super(field, selectorRegex, groupSymbol);
  }
}
