import { Enumerable } from '@tstdl/base/enumerable';
import { QueryBody } from '../search-engine/query';
import { BoolQueryBuilder, MatchAllQueryBuilder } from '../search-engine/query/builder';
import { ChannelSegmentConverter } from './converters/channel';
import { DefaultSegmentConverter } from './converters/default';
import { DescriptionSegmentConverter } from './converters/description';
import { DurationSegmentConverter } from './converters/duration';
import { TitleSegmentConverter } from './converters/title';
import { TopicSegmentConverter } from './converters/topic';
import { Segment } from './segment';
import { SegmentConverter, SegmentConverterResult } from './segment-converter';
import { segmentize } from './segmentizer';

const DEFAULT_CONVERTERS: SegmentConverter[] = [
  new ChannelSegmentConverter(),
  new DescriptionSegmentConverter(),
  new DurationSegmentConverter(),
  new TitleSegmentConverter(),
  new TopicSegmentConverter(),
  new DefaultSegmentConverter()
];

const matchAllQueryBuilder = new MatchAllQueryBuilder();

export class SearchStringParser {
  private readonly converters: SegmentConverter[];

  constructor(converters: SegmentConverter[] = DEFAULT_CONVERTERS) {
    this.converters = converters;
  }

  parse(text: string): QueryBody {
    const trimmedText = text.trim();
    const segments = segmentize(trimmedText);

    const groupedResults = Enumerable.from(segments)
      .filter((segment) => segment.value.length > 0)
      .map((result) => this.convertSegment(result))
      .filter((result) => result != undefined)
      .cast<SegmentConverterResult>()
      .toArray();

    if (groupedResults.length == 0) {
      return matchAllQueryBuilder.build();
    }

    const query = createQuery(groupedResults);
    return query;
  }

  private convertSegment(segment: Segment): SegmentConverterResult | undefined {
    for (const converter of this.converters) {
      const result = converter.tryConvert(segment);

      if (result != undefined) {
        return result;
      }
    }

    return undefined;
  }
}

function createQuery(results: SegmentConverterResult[]): QueryBody {
  const boolQueryBuilder = new BoolQueryBuilder();

  for (const result of results) {
    boolQueryBuilder
      .must(...(result.must ?? []))
      .should(...(result.should ?? []))
      .not(...(result.not ?? []))
      .filter(...(result.filter ?? []));
  }

  const query = boolQueryBuilder.build();
  return query;
}
