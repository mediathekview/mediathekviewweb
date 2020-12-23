import { fields } from '$shared/models/core';
import type { SegmentConverter } from '../segment-converter';
import { TextSegmentConverterBase } from './text-base';

const field = fields.channel;
const selectorRegex = /^(?:c(?:h(?:a(?:n(?:n(?:e(?:l)?)?)?)?)?)?|s(?:e(?:n(?:d(?:e(?:r)?)?)?)?)?|!)$/u;
const groupSymbol = Symbol('channel group');

export class ChannelSegmentConverter extends TextSegmentConverterBase implements SegmentConverter {
  constructor() {
    super(field, selectorRegex, groupSymbol);
  }
}
