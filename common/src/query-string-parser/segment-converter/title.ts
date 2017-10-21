import { Field } from '../../model';
import { TextSegmentConverter } from './text-base';

export class TitleSegmentConverter extends TextSegmentConverter {
  constructor() {
    super(/\+|title:/, 'and', Field.Title);
  }
}
