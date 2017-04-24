import * as Elasticsearch from 'elasticsearch';
import * as Process from 'process';

import { ElasticsearchHelpers } from './helpers';

import { ISearchEngine } from '../search-engine';
import { Query, QueryResponse, Entry, Quality } from '../../model';

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

            this.elasticsearchClient.search<Entry>(esQuery, (err, response: Elasticsearch.SearchResponse<Entry>) => {
                if (err) {
                    reject(err);
                    console.error(err);
                } else {
                    let queryResponse = this.processResponse(response, begin)
                    resolve(queryResponse);
                }
            });
        });
    }

    private processResponse(response: Elasticsearch.SearchResponse<Entry>, begin: [number, number]): QueryResponse {
        let entries: Entry[] = [];

        for (let i = 0; i < response.hits.hits.length; i++) {
            let entry = response.hits.hits[i]._source;
            entry.id = response.hits.hits[i]._id;

            this.convertOldToNew(entry);

            entries.push(entry);
        }

        let end = process.hrtime(begin);
        let time = (end[0] * 1e3 + end[1] / 1e6);

        return {
            entries: entries,
            queryInfo: {
                totalResults: response.hits.total,
                time: time
            }
        }
    }

    private convertOldToNew(entry: Entry) {
        entry.website = entry['url_website'];
        delete entry['url_website'];
        delete entry['url_subtitle'];

        entry.videos = [];
        if (entry['url_video']) {
            entry.videos.push({ quality: Quality.Medium, url: entry['url_video'], size: entry['size'] });
            delete entry['url_video'];
            delete entry['size'];
        }
        if (entry['url_video_low']) {
            entry.videos.push({ quality: Quality.Low, url: entry['url_video_low'], size: null });
            delete entry['url_video_low'];
        }
        if (entry['url_video_hd']) {
            entry.videos.push({ quality: Quality.High, url: entry['url_video_hd'], size: null });
            delete entry['url_video_hd'];
        }
    }
}
