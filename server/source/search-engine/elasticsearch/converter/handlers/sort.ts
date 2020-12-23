import { StringMap } from '@tstdl/base/types';
import { Aggregation, Sort } from '$shared/search-engine/query';

type ElasticsearchSortOrder = 'asc' | 'desc';
type ElasticsearchSortMode = 'min' | 'max' | 'sum' | 'avg' | 'median';
type ElasticsearchSort = string | StringMap<{ order?: ElasticsearchSortOrder, mode?: ElasticsearchSortMode }> | StringMap<ElasticsearchSortOrder>;

export class SortConverter {
  private readonly sortKeywordRewrite: Set<string>;

  constructor(sortKeywordRewrite: Set<string> = new Set()) {
    this.sortKeywordRewrite = sortKeywordRewrite;
  }

  convert(sort: Sort): object {
    if (sort.aggregation == 'length') {
      return lengthSort(sort);
    }

    const sortObj: ElasticsearchSort = {};

    const field = this.sortKeywordRewrite.has(sort.field) ? `${sort.field}.keyword` : sort.field;

    if (sort.aggregation == undefined) {
      const order = (sort.order == 'ascending') ? 'asc' : 'desc';
      sortObj[field] = order;
    }
    else {
      const order = (sort.order == 'ascending') ? 'asc' : 'desc';
      const mode = aggregationToMode(sort.aggregation);

      sortObj[field] = { order, mode };
    }

    return sortObj;
  }
}

function aggregationToMode(aggregation: Aggregation): ElasticsearchSortMode {
  switch (aggregation) {
    case Aggregation.Min:
    case Aggregation.Max:
    case Aggregation.Sum:
    case Aggregation.Median:
      return aggregation;

    case Aggregation.Average:
      return 'avg';

    case Aggregation.Length:
      throw new Error('call lengthSort for sorting by length');

    default:
      throw new Error(`${aggregation as string} not implemented`);
  }
}

function lengthSort(sort: Sort): object {
  const scriptObj = {
    _script: {
      type: 'number',
      script: {
        lang: 'expression',
        inline: `doc['${sort.field}'].length`
      },
      order: (sort.order == 'ascending') ? 'asc' : 'desc'
    }
  };

  return scriptObj;
}
