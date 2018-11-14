import { IncomingMessage, Server, ServerResponse } from 'http';
import { MiddlewareExposer, ParameterVerifierExposerMiddleware } from './api/exposer/middleware';
import { RestExposer } from './api/exposer/rest';
import { ErrorType, Response, ResultError } from './common/api/rest';
import { AggregatedEntry } from './common/model';
import { SearchEngine, SearchQuery, SearchResult } from './common/search-engine';
import { InstanceProvider } from './instance-provider';

const REST_PREFIX = '/api/v2';
const SEARCH_PATH = ['search'];

export class MediathekViewWebExposer {
  private readonly server: Server;

  private searchEngine: SearchEngine<AggregatedEntry> | null;
  private restExposer: RestExposer;
  private exposer: MiddlewareExposer | null;
  private parameterVerifier: ParameterVerifierExposerMiddleware<any> | null;

  constructor(server: Server) {
    this.server = server;

    this.searchEngine = null;
    this.exposer = null;
    this.parameterVerifier = null;
  }

  async initialize() {
    this.restExposer = new RestExposer(REST_PREFIX);
    this.exposer = new MiddlewareExposer(this.restExposer);
    this.parameterVerifier = new ParameterVerifierExposerMiddleware();
    this.searchEngine = await InstanceProvider.entrySearchEngine();

    this.initRequestHandler();
  }

  private initRequestHandler() {
    this.server.on('request', (request: IncomingMessage, response: ServerResponse) => {
      this.restExposer.handleRequest(request, response);
    });
  }

  expose() {
    if (this.exposer == null || this.parameterVerifier == null) {
      throw new Error('not initialized');
    }

    this.exposer.registerMiddleware(this.parameterVerifier);

    this.exposeSearch();
  }

  private exposeSearch() {
    this.parameterVerifier!
      .addRequired(SEARCH_PATH, 'body')
      .addOptional(SEARCH_PATH, 'sort', 'skip', 'limit');

    this.exposer!.expose(SEARCH_PATH, async (parameters) => {
      const response: Response<SearchResult<AggregatedEntry>> = {};

      try {
        response.result = await this.searchEngine!.search(parameters as SearchQuery);
      }
      catch (error) {
        response.errors = this.getResultErrors(error);
      }

      return response;
    });
  }

  private getResultErrors(...errors: Error[]): ResultError[] {
    const resultErrors = errors.map(this.getResultError);
    return resultErrors;
  }

  private getResultError(error: Error): ResultError {
    const details = `${error.name}: ${error.message}`;
    const resultError = {
      type: ErrorType.ServerError,
      details
    };

    return resultError;
  }
}