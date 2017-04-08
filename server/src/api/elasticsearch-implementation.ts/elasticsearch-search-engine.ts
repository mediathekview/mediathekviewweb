import * as Elasticsearch from 'elasticsearch';
import * as Process from 'process';

import { ElasticsearchHelpers } from './helpers';

import { ISearchEngine } from '../search-engine';
import { Query, QueryResponse, Entry } from '../../model';

const INDEX = 'filmliste';
const TYPE = 'entries';

export class ElasticsearchSearchEngine implements ISearchEngine {
    elasticsearchClient: Elasticsearch.Client;

    constructor(host: string, port: number) {
        this.elasticsearchClient = new Elasticsearch.Client({ host: `${host}:${port}` });
    }

    query(query: Query): Promise<QueryResponse> {
        let begin = process.hrtime();

        return new Promise<QueryResponse>((resolve, reject) => {
            let esQuery = ElasticsearchHelpers.buildElasticsearchQuery(query, INDEX, TYPE);

            let promise = this.elasticsearchClient.search<Entry>(esQuery, (err, response: Elasticsearch.SearchResponse<Entry>) => {
                if (err) {
                    reject(err);
                } else {
                    let entries: Entry[] = [];

                    for (let i = 0; i < response.hits.hits.length; i++) {
                        let entry = response.hits.hits[i]._source;
                        entry.id = response.hits.hits[i]._id;
                        entries.push(entry);
                    }

                    let end = process.hrtime(begin);
                    let time = (end[0] * 1e3 + end[1] / 1e6);

                    resolve({
                        entries: entries,
                        queryInfo: {
                            totalResults: response.hits.total,
                            time: time
                        }
                    });
                }
            });
        });
    }
}
