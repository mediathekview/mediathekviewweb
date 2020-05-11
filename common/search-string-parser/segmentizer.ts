import { Segment, SegmentType } from './segment';

const SEGMENTATION_REGEX = /(?:"(.*?)")|(?:"[^"]+)|(?:\b[^\s"]+)/ug;
const SEGMENT_PARSE_REGEX = /^(\^|-)?(?:(?:(\w+):)|([!#*+]))?(?:(?:\/(.*?)\/)|(?:"(.*?)")|(.*?))$/u

export function segmentize(search: string): Segment[] {
  const regex = new RegExp(SEGMENTATION_REGEX);
  const segments: Segment[] = [];

  let match: RegExpExecArray | null;
  while ((match = regex.exec(search)) != undefined) {
    const segment = parseSegment(match[0], match.index);
    segments.push(segment);
  }

  return segments;
}

function parseSegment(segmentString: string, index: number): Segment {
  const match = SEGMENT_PARSE_REGEX.exec(segmentString);

  if (match == undefined) {
    throw new Error(`${segmentString} - no match, should not happen`);
  }

  const [, excludeString, selectorA, selectorB, patternValue, quotedValue, nonQuotedValue] = match;

  const selector = selectorA ?? selectorB ?? '_NONE_';
  const exclude = (excludeString != undefined);
  const value = patternValue ?? (quotedValue ?? nonQuotedValue).trim();
  const type =
    (patternValue != undefined) ? SegmentType.Pattern
      : (quotedValue != undefined) ? SegmentType.Quoted
        : SegmentType.Normal;

  return {
    exclude,
    value,
    sourceIndex: index,
    sourceLength: segmentString.length,
    type,
    selector
  };
}
