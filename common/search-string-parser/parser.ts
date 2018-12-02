import { SyncEnumerable } from '../enumerable';
import { QueryBody } from '../search-engine/query';
import { BoolQueryBuilder } from '../search-engine/query/builder';
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

export class SearchStringParser {
  private readonly converters: SegmentConverter[];
  private readonly segmentizer: Segmentizer;

  constructor() {
    this.converters = CONVERTERS;
    this.segmentizer = new Segmentizer();
  }

  parse(text: string): QueryBody {
    const segments = this.segmentizer.segmentize(text);

    const groupedResults = SyncEnumerable.from(segments)
      .map((result) => this.convertSegment(result))
      .filter((result) => result != null)
      .cast<SegmentConverterResultArray>()
      .mapMany((items) => items)
      .group((result) => this.groupResultSelector(result))
      .map(([, results]) => results);

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
        }
      }

      boolQueryBuilder.filter(innerBoolQueryBuilder);
    }

    const query = boolQueryBuilder.build();
    return query;
  }

  private convertSegment(segment: Segment): SegmentConverterResultArray | null {
    for (const converter of this.converters) {
      const result = converter.tryConvert(segment);

      if (result != null) {
        return result;
      }
    }

    return null;
  }
}
