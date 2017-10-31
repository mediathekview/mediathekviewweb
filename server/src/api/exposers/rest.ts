import * as Koa from 'koa';
import * as KoaRouter from 'koa-router';
import * as KoaBodyParser from 'koa-bodyparser';
import * as HTTP from 'http';
import { Nullable } from '../../common/utils';
import { QueryObject, SearchEngineSearchResult, Entry } from '../api';
import { MediathekViewWebAPI } from '../../common/api';
import { SocketResponse, APIError } from '../../common/api/socket-io';

type Acknowledgement<T> = (response: SocketResponse<T>) => void;

export class SocketIOMediathekViewWebAPIExposer {
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

    this.router.get('/query/json', (context, next) => this.query(context, next));
  }

  private async query(context: KoaRouter.IRouterContext, next: () => Promise<any>) {
    console.log(context.request.body);
    next();
  }
}
