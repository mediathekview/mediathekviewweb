import { Segment } from './segment';

const SEGMENTATION_REGEX = /[^"\s]*[\""].+?[\""]|[^\s]+/g;

export class Segmentizer {
  segmentize(search: string): Segment[] {
    const regex = new RegExp(SEGMENTATION_REGEX);

    const segments: Segment[] = [];

    let match: RegExpExecArray | null;
    while ((match = regex.exec(search)) != null) {
      const segmentString = match[0];

      const segment = Segment.fromString(segmentString);
      segments.push(segment);
    }

    return segments;
  }
}
