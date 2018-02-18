import { Server } from 'http';

import { ErrorType as ErrorType, Result } from './api/exposer';
import { MiddlewareExposer, ParameterVerifierExposerMiddleware } from './api/exposer/middleware';
import { RestExposer } from './api/exposer/rest';
import { AggregatedEntry } from './common/api';
import { SearchEngine, SearchQuery } from './common/search-engine';

const EXPOSE_PATH = '/api';
const SEARCH_PATH = ['search'];

export class MediathekViewWebExpose {
  private readonly searchEngine: SearchEngine<AggregatedEntry>;

  private readonly exposer: MiddlewareExposer;
  private readonly parameterVerifier: ParameterVerifierExposerMiddleware;

  constructor(searchEngine: SearchEngine<AggregatedEntry>, server: Server) {
    this.searchEngine = searchEngine;

    const restExposer = new RestExposer(server, EXPOSE_PATH);
    this.exposer = new MiddlewareExposer(restExposer);
    this.parameterVerifier = new ParameterVerifierExposerMiddleware();
  }

  expose() {
    this.exposer.registerMiddleware(this.parameterVerifier);

    this.exposeSearch();
  }

  private exposeSearch() {
    this.parameterVerifier
      .addRequired(SEARCH_PATH, 'body')
      .addOptional(SEARCH_PATH, 'sorts', 'skip', 'limit');

    this.exposer.expose(SEARCH_PATH, async (parameters) => {
      const out: Result = {};

      try {
        out.result = await this.searchEngine.search(parameters as SearchQuery);
      }
      catch (error) {
        out.errors = [{ type: ErrorType.ServerError, details: error }];
      }

      return out;
    });
  }
}