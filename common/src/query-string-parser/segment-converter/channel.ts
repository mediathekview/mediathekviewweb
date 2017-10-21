import { Field } from '../../model';
import { TextSegmentConverter } from './text-base';

export class ChannelSegmentConverter extends TextSegmentConverter {
  constructor() {
    super(/!|ch?a?n?n?e?l?:/, 'and', Field.Channel);
  }
}
