import { Query, Aggregation, Sort, IQuery, IBoolQuery, IRangeQuery, ITextQuery, IIDsQuery } from '../query';

export default function queryToElasticsearchQuery(query: Query, indexName: string, typeName: string): object {
  if (query.skip == undefined) {
    query.skip = 0;
  }

  if (query.limit == undefined) {
    query.limit = 25;
  } else if (query.limit > 100) {
    throw new Error(`${query.limit} is above 100`);
  }

  const elasticQuery = {
    index: indexName,
    type: typeName,
    from: query.skip,
    size: query.limit,
    body: {
      query: bodyToElasticsearchQuery(query.body, indexName, typeName)
    }
  };

  if (query.sorts != undefined && query.sorts.length > 0) {
    elasticQuery.body['sort'] = sortsToElasticsearchSort(query.sorts)
  }

  return elasticQuery;
}

function sortsToElasticsearchSort(sorts: Sort[]): object {
  const sortArray: object[] = [];

  for (let sort of sorts) {
    if (sort.aggregation == 'length') {
      const sortObj = lengthSort(sort);
      break;
    }

    const sortObj = {};

    sortObj[sort.field] = {
      order: (sort.order == 'ascending') ? 'asc' : 'desc',
    }

    if (sort.aggregation != undefined) {
      sortObj['mode'] = aggregationToMode(sort.aggregation);
    }

    sortArray.push(sortObj);
  }

  return sortArray;
}

function aggregationToMode(aggregation: Aggregation): string {
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

function lengthSort(sort: Sort): object {
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

function bodyToElasticsearchQuery(query: IQuery, indexName: string, typeName: string): object {
  if ('bool' in query) {
    return convertBoolQuery(query as IBoolQuery, indexName, typeName);
  } else if ('range' in query) {
    return convertRangeQuery(query as IRangeQuery);
  } else if ('text' in query) {
    return convertTextQuery(query as ITextQuery);
  } else if ('matchAll' in query) {
    return { match_all: {} };
  } else if ('ids' in query) {
    return convertIDsQuery(query as IIDsQuery, typeName);
  } else {
    throw new Error('query is invalid');
  }
}

function convertBoolQuery(query: IBoolQuery, indexName: string, typeName: string): object {
  const queryObj = {
    bool: {}
  };

  if (query.bool.must != undefined) {
    queryObj.bool['must'] = query.bool.must.map((query) => bodyToElasticsearchQuery(query, indexName, typeName));
  }
  if (query.bool.should != undefined) {
    queryObj.bool['should'] = query.bool.should.map((query) => bodyToElasticsearchQuery(query, indexName, typeName));
  }
  if (query.bool.not != undefined) {
    queryObj.bool['must_not'] = query.bool.not.map((query) => bodyToElasticsearchQuery(query, indexName, typeName));
  }
  if (query.bool.filter != undefined) {
    queryObj.bool['filter'] = query.bool.filter.map((query) => bodyToElasticsearchQuery(query, indexName, typeName));
  }

  return queryObj;
}

function convertRangeQuery(query: IRangeQuery): object {
  const queryObj = {
    range: {}
  };

  queryObj.range[query.range.field] = {};

  if (query.range.lt != undefined) {
    queryObj.range[query.range.field]['lt'] = convertRangeValue(query.range.lt);
  }
  if (query.range.lte != undefined) {
    queryObj.range[query.range.field]['lte'] = convertRangeValue(query.range.lte);
  }
  if (query.range.gt != undefined) {
    queryObj.range[query.range.field]['gt'] = convertRangeValue(query.range.gt);
  }
  if (query.range.gte != undefined) {
    queryObj.range[query.range.field]['gte'] = convertRangeValue(query.range.gte);
  }

  return queryObj;
}

function convertRangeValue(value: string | number): string | number {
  if (typeof value == 'number') {
    return value;
  }

  const converted = value
    .replace(/seconds?/, 's')
    .replace(/minutes?/, 'm')
    .replace(/hours?/, 'h')
    .replace(/days?/, 'd')
    .replace(/weeks?/, 'w')
    .replace(/months?/, 'M')
    .replace(/years?/, 'y');

  return converted;
}

function convertIDsQuery(query: IIDsQuery, typeName: string): object {
  return {
    ids: {
      type: typeName,
      values: query.ids
    }
  };
}

function convertTextQuery(query: ITextQuery): object {
  if (query.text.fields.length == 1) {
    return convertToMatch(query.text.fields[0], query.text.text);
  } else if (query.text.fields.length > 1) {
    return convertToMultiMatch(query);
  } else {
    throw new Error('no fields specified');
  }
}

function convertToMatch(field: string, text: string): object {
  const queryObj = {
    match: {}
  };

  queryObj.match[field] = text;

  return queryObj;
}

function convertToMultiMatch(query: ITextQuery): object {
  const queryObj = {
    multi_match: {
      type: 'cross_fields',
      fields: query.text.fields,
      query: query.text.text,
      operator: query.text.operator
    }
  };

  return queryObj;
}
