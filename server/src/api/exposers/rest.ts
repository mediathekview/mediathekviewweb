import * as Koa from 'koa';
import * as KoaRouter from 'koa-router';
import * as KoaBodyParser from 'koa-bodyparser';
import * as HTTP from 'http';
import { Nullable } from '../../common/utils';
import { QueryObject, SearchEngineSearchResult, Entry } from '../api';
import { MediathekViewWebAPI, APIError, APIResponse } from '../../common/api';

export class RESTMediathekViewWebAPIExposer {
  private koa: Koa;
  private router: KoaRouter;
  private bodyParser: Koa.Middleware;

  constructor(private api: MediathekViewWebAPI, private httpServer: HTTP.Server, private path: string = '/api') {
    this.koa = new Koa();
    this.router = new KoaRouter();
    this.bodyParser = KoaBodyParser();

    this.initialize();
  }

  private initialize() {
    this.httpServer.on('request', this.koa.callback());

    this.setRoutes();

    this.koa.use(this.bodyParser);
    this.koa.use(this.router.routes());
    this.koa.use(this.router.allowedMethods());
  }

  private setRoutes() {
    this.router.prefix(this.path);

    this.router.post('/query/json', (context, next) => this.queryJSON(context, next));
  }

  private async queryJSON(context: KoaRouter.IRouterContext, next: () => Promise<any>) {
    const query = context.request.body;

    const result = await this.api.search(query);

    const response: APIResponse<SearchEngineSearchResult<Entry>> = { result: result };

    context.response.body = response;
    next();
  }
}
