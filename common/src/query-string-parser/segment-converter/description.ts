import { Field } from '../../model';
import { TextSegmentConverter } from './text-base';

export class DescriptionSegmentConverter extends TextSegmentConverter {
  constructor() {
    super(/\*|descr?i?p?t?i?o?n?:/, 'and', Field.Description);
  }
}
