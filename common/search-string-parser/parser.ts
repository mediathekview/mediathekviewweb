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
import { SegmentConverter, SegmentConverterResult, SegmentConverterResultArray, SegmentConverterResultType } from './segment-converter';
import { Segmentizer } from './segmentizer';

const CONVERTERS: SegmentConverter[] = [
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
  private readonly segmentizer: Segmentizer;

  constructor() {
    this.converters = CONVERTERS;
    this.segmentizer = new Segmentizer();
  }

  parse(text: string): QueryBody {
    const trimmedText = text.trim();
    const segments = this.segmentizer.segmentize(trimmedText);

    const groupedResults = Enumerable.from(segments)
      .filter((segment) => segment.text.length > 0)
      .map((result) => this.convertSegment(result))
      .filter((result) => result != undefined)
      .cast<SegmentConverterResultArray>()
      .mapMany((items) => items)
      .group((result) => this.groupResultSelector(result))
      .map(([, results]) => results)
      .toArray();

    if (groupedResults.length == 0) {
      return matchAllQueryBuilder.build();
    }

    const query = this.createQuery(groupedResults);
    return query;
  }

  private groupResultSelector(result: SegmentConverterResult): string {
    return result.fields.sort().join('+');
  }

  private createQuery(groupedResults: Iterable<SegmentConverterResult[]>): QueryBody {
    const boolQueryBuilder = new BoolQueryBuilder();

    for (const results of groupedResults) {
      const innerBoolQueryBuilder = new BoolQueryBuilder();

      for (const result of results) {
        switch (result.type) {
          case SegmentConverterResultType.Include:
            if (result.joinSameFieldsResults) {
              innerBoolQueryBuilder.must(result.query);
            } else {
              innerBoolQueryBuilder.should(result.query);
            }
            break;

          case SegmentConverterResultType.Exclude:
            innerBoolQueryBuilder.not(result.query);
            break;

          default:
            throw new Error('unknown SegmentConverterResultType');
        }
      }

      boolQueryBuilder.filter(innerBoolQueryBuilder);
    }

    const query = boolQueryBuilder.build();
    return query;
  }

  private convertSegment(segment: Segment): SegmentConverterResultArray | undefined {
    for (const converter of this.converters) {
      const result = converter.tryConvert(segment);

      if (result != undefined) {
        return result;
      }
    }

    return undefined;
  }
}
