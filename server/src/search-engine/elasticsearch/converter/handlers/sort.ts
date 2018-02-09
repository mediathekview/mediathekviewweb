import { Aggregation, Sort } from '../../../../common/search-engine';

type ElasticsearchSortOrder = 'asc' | 'desc'
type ElasticsearchSortMode = 'min' | 'max' | 'sum' | 'avg' | 'median'
type ElasticsearchSort = string | { [key: string]: { order?: ElasticsearchSortOrder, mode?: ElasticsearchSortMode } } | { [key: string]: ElasticsearchSortOrder }

export class SortConverter {

  convert(sort: Sort): object {
    if (sort.aggregation == 'length') {
      const lengthSort = this.lengthSort(sort);
      return lengthSort;
    }

    const sortObj: ElasticsearchSort = {};

    if (sort.aggregation == undefined) {
      const order = (sort.order == 'ascending') ? 'asc' : 'desc';
      sortObj[sort.field] = order;
    }
    else {
      const order = (sort.order == 'ascending') ? 'asc' : 'desc';
      const mode = this.aggregationToMode(sort.aggregation);

      sortObj[sort.field] = {
        order: order,
        mode: mode
      }
    }

    return sortObj;
  }

  private aggregationToMode(aggregation: Aggregation): ElasticsearchSortMode {
    switch (aggregation) {
      case 'min':
      case 'max':
      case 'sum':
      case 'median':
        return aggregation;

      case 'average':
        return 'avg';

      case 'length':
        throw new Error('call lengthSort for sorting by length');
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