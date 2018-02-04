import '../extensions/array';

import { SyncEnumerable } from '../enumerable';
import { QueryBody } from '../search-engine/query';
import { BoolQueryBuilder } from '../search-engine/query/builder';
import { Segment } from './segment';
import { SegmentConverter, SegmentConverterResultArray } from './segment-converter';
import { Segmentizer } from './segmentizer';
import { SegmentConverterResult, SegmentConverterResultType } from './index';
import { ChannelSegmentConverter } from './converters/channel';
import { DescriptionSegmentConverter } from './converters/description';
import { DurationSegmentConverter } from './converters/duration';
import { TitleSegmentConverter } from './converters/title';
import { TopicSegmentConverter } from './converters/topic';

const CONVERTERS: SegmentConverter[] = [
  new ChannelSegmentConverter(),
  new DescriptionSegmentConverter(),
  new DurationSegmentConverter(),
  new TitleSegmentConverter(),
  new TopicSegmentConverter()
];

export class SearchStringParser {
  private readonly converters: SegmentConverter[];
  private readonly segmentizer: Segmentizer;

  constructor() {
    this.converters = [];
    this.segmentizer = new Segmentizer();
  }

  parse(text: string): QueryBody {
    const segments = this.segmentizer.segmentize(text).toEnumerable();

    const resultArrays = segments
      .map((result) => this.convertSegment(result))
      .filter((result) => result != null) as SyncEnumerable<SegmentConverterResultArray>;

    const groupedResults = resultArrays
      .mapMany((items) => items)
      .group((result) => result.field);

    const query = this.createQuery(groupedResults);
    return query;
  }

  private createQuery(groupedResults: Map<string, SegmentConverterResult[]>): QueryBody {
    const boolQueryBuilder = new BoolQueryBuilder();

    for (const [field, results] of groupedResults) {
      const innerBoolQueryBuilder = new BoolQueryBuilder();

      for (const result of results) {
        switch (result.type) {
          case SegmentConverterResultType.Include:
            innerBoolQueryBuilder.should(result.query);
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