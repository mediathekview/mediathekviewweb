import { Field } from '../../model';
import { TextSegmentConverter } from './text-base';

export class TopicSegmentConverter extends TextSegmentConverter {
  constructor() {
    super(/#|topic:/, 'and', Field.Topic);
  }
}
