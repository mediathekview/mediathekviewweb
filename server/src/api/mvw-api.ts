import { IMediathekViewWebAPI, IAPIResponse, QueryResponse, QueryInfo, GetServerStateResponse, Query } from '../model';

import { ISearchEngine } from './search-engine';

export class MVWAPIService implements IMediathekViewWebAPI {
    searchEngine: ISearchEngine;

    constructor(searchEngine: ISearchEngine) {
        this.searchEngine = searchEngine;
    }

    query(query: Query): Promise<QueryResponse> {
        return this.searchEngine.query(query);
    }

    getServerState(): Promise<GetServerStateResponse> {
        return Promise.reject('not implemented');
    }
}
