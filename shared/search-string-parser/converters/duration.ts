import { fields } from '$shared/models/core';
import type { QueryBody } from '../../search-engine/query';
import { RangeQueryBuilder, TermQueryBuilder } from '../../search-engine/query/builder';
import type { Range } from '../parsers/range';
import { parseRange, RangeType } from '../parsers/range';
import { parseTime } from '../parsers/time';
import type { Segment } from '../segment';
import type { SegmentConverter, SegmentConverterResult } from '../segment-converter';
import { SelectorSegmentConverterBase } from './selector-segment-converter-base';

const field = fields.duration;
const selectorRegex = /^(?:du(?:r(?:a(?:t(?:i(?:o(?:n)?)?)?)?)?)?|dau(?:e(?:r)?)?)$/u;
const groupSymbol = Symbol('duration group');
const rangeInclusive = true;

export class DurationSegmentConverter extends SelectorSegmentConverterBase implements SegmentConverter {
  constructor() {
    super(field, selectorRegex);
  }

  protected convert(segment: Segment): SegmentConverterResult | undefined {
    const ranges = parseRange(segment.value, rangeInclusive);

    let query: QueryBody | undefined;

    if (ranges == undefined) {
      return undefined;
    }
    else if (ranges.length == 1) {
      query = this.convertSingle(ranges[0]!);
    }
    else if (ranges.length == 2) {
      query = this.convertFromTo(ranges[0]!, ranges[1]!);
    }
    else {
      throw new Error(`did not expected a range count of ${ranges.length}`);
    }

    return { group: groupSymbol, filter: [query] };
  }

  private convertSingle(range: Range): QueryBody {
    let queryBuilder: TermQueryBuilder | RangeQueryBuilder;

    switch (range.type) {
      case RangeType.Equals:
        const termQueryBuilder = new TermQueryBuilder();
        const time = parseTime(range.text);
        termQueryBuilder.value(time);
        queryBuilder = termQueryBuilder;

        break;

      default:
        const rangeQueryBuilder = new RangeQueryBuilder();
        this.setRange(rangeQueryBuilder, range);
        queryBuilder = rangeQueryBuilder;

        break;
    }

    const query = queryBuilder
      .field(field)
      .build();

    return query;
  }

  private convertFromTo(from: Range, to: Range): QueryBody {
    const rangeQueryBuilder = new RangeQueryBuilder();
    rangeQueryBuilder.field(field);

    this.setRange(rangeQueryBuilder, from);
    this.setRange(rangeQueryBuilder, to);

    const query = rangeQueryBuilder.build();
    return query;
  }

  private setRange(rangeQueryBuilder: RangeQueryBuilder, range: Range): void {
    const time = parseTime(range.text);

    switch (range.type) {
      case RangeType.Greater:
        rangeQueryBuilder.gt(time);
        break;

      case RangeType.GreaterEquals:
        rangeQueryBuilder.gte(time);
        break;

      case RangeType.Less:
        rangeQueryBuilder.lt(time);
        break;

      case RangeType.LessEquals:
        rangeQueryBuilder.lte(time);
        break;

      default:
        throw new Error('unknown RangeType');
    }
  }
}
