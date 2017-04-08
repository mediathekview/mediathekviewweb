import * as Elasticsearch from 'elasticsearch';

import { Query, Match, IFilter, FilterType, RangeFilter } from '../../model';

export class ElasticsearchHelpers {
    static buildElasticsearchQuery(query: Query, index: string, type: string): Elasticsearch.SearchParams {
        let esQuery: Elasticsearch.SearchParams = {
            index: index,
            type: type,
            from: query.offset,
            size: query.size,
            body: {
                query: {
                    bool: {
                        filter: []
                    }
                },
                sort: {}
            }
        };

        let musts = this.createMusts(query);
        if (musts != null) {
            esQuery.body.query.bool['must'] = musts;
        }

        let esFilters = this.createFilters(query);
        if (esFilters != null) {
            esQuery.body.query.bool['filter'] = esFilters;
        }

        return esQuery;
    }

    static createMusts(query): Array<object> {
        let musts = [];

        let matches: Match[] = [];

        if (query.matches == undefined) {
            musts.push({ match_all: {} });
        } else {
            matches = Array.isArray(query.matches) ? query.matches : [query.matches];
        }

        for (let i = 0; i < matches.length; i++) {
            let match = matches[i];
            let fields = Array.isArray(match.fields) ? match.fields : [match.fields];

            let esMatch = this.createMatch(fields, match.text);

            if (esMatch != null) {
                musts.push(esMatch);
            }
        }

        return musts.length > 0 ? musts : null;
    }

    static createFilters(query): Array<object> {
        let esFilters = [];

        let filters: IFilter[] = [];

        if (query.filters != undefined) {
            filters = Array.isArray(query.filters) ? query.filters : [query.filters];
        }

        for (let i = 0; i < filters.length; i++) {
            let filter = filters[i];

            let esFilter;
            switch (filter.type) {
                case FilterType.RangeFilter:
                    esFilter = this.createRangeFilter(filter);
                    break;
            }

            esFilters.push(esFilter);
        }

        return esFilters.length > 0 ? esFilters : null;
    }

    static createRangeFilter(rangeFilter: RangeFilter): object {
        let esRangeFilter = { range: {} };
        esRangeFilter.range[rangeFilter.field] = {};

        if (rangeFilter.gt != undefined) {
            esRangeFilter.range[rangeFilter.field]['gt'] = rangeFilter.gt;
        }
        if (rangeFilter.gte != undefined) {
            esRangeFilter.range[rangeFilter.field]['gte'] = rangeFilter.gte;
        }
        if (rangeFilter.lt != undefined) {
            esRangeFilter.range[rangeFilter.field]['lt'] = rangeFilter.lt;
        }
        if (rangeFilter.lte != undefined) {
            esRangeFilter.range[rangeFilter.field]['lte'] = rangeFilter.lte;
        }

        return esRangeFilter;
    }

    static createMatch(fields: string[], text: string): object {
        if (fields.length == 0) {
            return null;
        }

        let esMatch;

        if (fields.length > 1) {
            esMatch = this.createMultiMatch(fields, text);
        } else if (fields.length == 1) {
            esMatch = { match: {} };
            esMatch.match[fields[0]] = text;
        }

        return esMatch;
    }

    static createMultiMatch(fields: string[], text: string): object {
        return {
            multi_match: {
                query: text,
                type: 'cross_fields',
                fields: fields,
                operator: 'and'
            }
        };
    }
}
