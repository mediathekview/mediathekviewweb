import { Enumerable } from '@tstdl/base/enumerable';
import { assertDefinedPass } from '@tstdl/base/utils';
import type { Segment } from './segment';
import { SegmentType } from './segment';

const SEGMENTATION_REGEX = /(?:"(.*?)")|(?:"[^"]+)|(?:[^\s"]+)/ug;
const SEGMENT_PARSE_REGEX = /^(\^|-)?(?:(?:(\w+):)|([!#*+]))?(?:(?:\/(.*?)\/)|(?:"(.*?)")|(.*?))$/u

export function segmentize(search: string): Segment[] {
  return Enumerable.from(search.matchAll(SEGMENTATION_REGEX))
    .map((match) => parseSegment(assertDefinedPass(match[0]), assertDefinedPass(match.index)))
    .toArray();
}

function parseSegment(segmentString: string, index: number): Segment {
  const match = SEGMENT_PARSE_REGEX.exec(segmentString);

  if (match == undefined) {
    throw new Error(`${segmentString} - no match, should not happen`);
  }

  const [, excludeString, selectorA, selectorB, patternValue, quotedValue, nonQuotedValue] = match;

  const selector = selectorA ?? selectorB ?? '_NONE_';
  const exclude = (excludeString != undefined);
  const value = patternValue ?? (quotedValue ?? nonQuotedValue)!.trim();
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
