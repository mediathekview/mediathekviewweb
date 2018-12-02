import { Segment } from './segment';

const SEGMENTATION_REGEX = /\S*\".*?\"|\S*\"[^\"]+|[^\s\"]+/g;

export class Segmentizer {
  segmentize(search: string): Segment[] {
    const regex = new RegExp(SEGMENTATION_REGEX);

    const segmentStrings: string[] = [];

    let match: RegExpExecArray | null;
    while ((match = regex.exec(search)) != null) {
      const segmentString = match[0];
      segmentStrings.push(segmentString);
    }

    const segments = segmentStrings.map((segmentString) => Segment.fromString(segmentString));
    const nonEmptySegments = segments.filter((segment) => segment.text.length > 0);

    return nonEmptySegments;
  }
}
