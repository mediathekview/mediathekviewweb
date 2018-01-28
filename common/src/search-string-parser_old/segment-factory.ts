import { SegmentHandler } from './segment-handler';
import { Segment } from './segment';

export class SegmentFactory {
  private segmentizeFunction: (text: string) => string[];

  private selectorCache: Map<string, string> = new Map();
  private segmentHandlers: SegmentHandler[] = [];

  constructor(segmentHandlers: SegmentHandler[], segmentizeFunction: (text: string) => string[]) {
    this.segmentHandlers = segmentHandlers;
    this.segmentizeFunction = segmentizeFunction;
  }

  segmentize(text: string): Segment[] {
    const textSegments = this.segmentizeFunction(text);
    const segments: Segment[] = [];

    for (let textSegment of textSegments) {
      const segment = new Segment(textSegment, this.segmentHandlers);
      segments.push(segment);
    }

    return segments;
  }
}
