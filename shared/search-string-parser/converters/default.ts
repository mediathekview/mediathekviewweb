import { fields as modelFields } from '$shared/models/core';
import type { SegmentConverter } from '../segment-converter';
import { TextSegmentConverterBase } from './text-base';

const fields = [modelFields.topic, modelFields.title];
const selectorRegex = /^_NONE_$/u;
const groupSymbol = Symbol('default group');

export class DefaultSegmentConverter extends TextSegmentConverterBase implements SegmentConverter {
  constructor() {
    super(fields, selectorRegex, groupSymbol);
  }
}
