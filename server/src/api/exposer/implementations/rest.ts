import * as Http from 'http';
import * as Koa from 'koa';
import * as KoaRouter from 'koa-router';
import * as KoaBodyParser from 'koa-bodyparser';

import { Exposer, ExposedFunction } from '../exposer';

export class RestExposer implements Exposer {
  private readonly server: Http.Server;
  private readonly prefix: string | null;
  private readonly koa: Koa;
  private readonly router: KoaRouter;
  private readonly bodyParser: Koa.Middleware;

  constructor(server: Http.Server);
  constructor(server: Http.Server, prefix: string);
  constructor(server: Http.Server, prefix: string | null = null) {
    this.server = server;
    this.prefix = prefix;

    this.koa = new Koa();
    this.router = new KoaRouter();
    this.bodyParser = KoaBodyParser();
  }

  initialize() {
    this.koa.proxy = true;

    if (this.prefix != null) {
      this.router.prefix(this.prefix);
    }

    this.koa.use(this.bodyParser);
    this.koa.use(this.router.routes());
    this.koa.use(this.router.allowedMethods());

    this.server.on('request', this.koa.callback());
  }

  expose(path: string[], func: ExposedFunction): void {
    const urlPath = `/${path.join('/')}`;

    this.router.post(urlPath, (context, next) => this.onRequest(context, next, func));
  }

  private async onRequest(context: KoaRouter.IRouterContext, next: () => Promise<any>, func: ExposedFunction): Promise<void> {
    const parameters = context.request.body;

    const result = await func(parameters);
    context.response.body = await func(parameters);

    await next();
  }
}