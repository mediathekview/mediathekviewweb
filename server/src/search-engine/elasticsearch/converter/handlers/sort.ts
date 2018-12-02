import { Aggregation, Sort } from '../../../../common/search-engine/query';

type ElasticsearchSortOrder = 'asc' | 'desc'
type ElasticsearchSortMode = 'min' | 'max' | 'sum' | 'avg' | 'median'
type ElasticsearchSort = string | StringMap<{ order?: ElasticsearchSortOrder, mode?: ElasticsearchSortMode }> | StringMap<ElasticsearchSortOrder>

export class SortConverter {
  private readonly sortKeywordRewrite: Set<string>;

  constructor();
  constructor(sortKeywordRewrite: Set<string>);
  constructor(sortKeywordRewrite: Set<string> = new Set()) {
    this.sortKeywordRewrite = sortKeywordRewrite;
  }

  convert(sort: Sort): object {
    if (sort.aggregation == 'length') {
      const lengthSort = this.lengthSort(sort);
      return lengthSort;
    }

    const sortObj: ElasticsearchSort = {};

    const field = this.sortKeywordRewrite.has(sort.field) ? `${sort.field}.keyword` : sort.field;

    if (sort.aggregation == undefined) {
      const order = (sort.order == 'ascending') ? 'asc' : 'desc';
      sortObj[field] = order;
    }
    else {
      const order = (sort.order == 'ascending') ? 'asc' : 'desc';
      const mode = this.aggregationToMode(sort.aggregation);

      sortObj[field] = {
        order: order,
        mode: mode
      }
    }

    return sortObj;
  }

  private aggregationToMode(aggregation: Aggregation): ElasticsearchSortMode {
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
        throw new Error(`${aggregation} not implemented`);
    }
  }

  private lengthSort(sort: Sort): object {
    const scriptObj = {
      _script: {
        type: 'number',
        script: {
          lang: 'expression',
          inline: `doc['${sort.field}'].length`,
        },
        order: (sort.order == 'ascending') ? 'asc' : 'desc'
      }
    };

    return scriptObj;
  }
}
