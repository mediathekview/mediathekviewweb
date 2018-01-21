import * as Koa from 'koa';
import * as KoaRouter from 'koa-router';
import * as KoaBodyParser from 'koa-bodyparser';
import * as HTTP from 'http';
import { Nullable } from '../../common/utils';
import { SearchApi, APIError, APIResponse, AggregatedEntry } from '../../common/api';
import { SearchResult } from '../../common/search-engine';
import { HighPrecisionTimer } from '../../utils';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { setTimeout } from 'timers';


export type PostFunction = (parameters: { [key: string]: any }) => Promise<any>;

export type RequestLog = {
  duration: number,
  path: string,
  ip: string
}

export class RestExposer {
  private readonly httpServer: HTTP.Server;
  private readonly pathPrefix: string;
  private readonly koa: Koa;
  private readonly router: KoaRouter;
  private readonly bodyParser: Koa.Middleware;
  private readonly requestLogSubject: Subject<RequestLog>;

  get requestLog(): Observable<RequestLog> {
    return this.requestLogSubject.asObservable();
  }

  constructor(backingApi: SearchApi, httpServer: HTTP.Server, pathPrefix: string) {
    this.httpServer = httpServer;
    this.pathPrefix = pathPrefix;

    this.koa = new Koa();
    this.router = new KoaRouter();
    this.bodyParser = KoaBodyParser();
    this.requestLogSubject = new Subject();

    this.initialize();
  }

  exposePost(path: string, postFunction: PostFunction) {
    this.router.post(path, )
  }

  private initialize() {
    this.koa.proxy = true;

    this.router.prefix(this.pathPrefix);

    this.koa.use((context, next) => this.requestLogger(context, next));
    this.koa.use(this.bodyParser);
    this.koa.use(this.router.routes());
    this.koa.use(this.router.allowedMethods());

    this.httpServer.on('request', this.koa.callback());
  }

  private async requestLogger(context: Koa.Context, next: () => Promise<void>): Promise<void> {
    const ms = await HighPrecisionTimer.measure(next);
    context.response.set('X-Response-Time', `${ms}ms`);
    const { path, ip } = context.request;

    setTimeout(() => this.requestLogSubject.next({ duration: ms, path: path, ip: ip }), 0);
  }

  private async handlePost(context: KoaRouter.IRouterContext, next: () => Promise<any>, postFunction: PostFunction) {
    const parameters = context.request.body;

    const response: RestResponse = {};

    try {
      response.result = await postFunction(parameters);
    } catch (error) {
      response.error = error;
    }
  }

  private setRoutes() {
    this.router.post('/query/json', (context, next) => this.queryJSON(context, next));
  }

  private async queryJSON(context: KoaRouter.IRouterContext, next: () => Promise<any>) {
    const query = context.request.body;

    let response: APIResponse<SearchResult<AggregatedEntry>>;

    try {
      const result = await this.backingApi.search(query);
      response = { result: result };
    }
    catch (error) {
      if (error instanceof Error) {
        response = { error: { name: error.name, message: error.message, stack: error.stack } };
      } else {
        const stack = (new Error()).stack;
        response = { error: { name: "UnknownError", message: JSON.stringify(error), stack: stack } };
      }
    }

    context.response.body = response;
    next();
  }
}
