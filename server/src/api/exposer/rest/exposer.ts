import * as Http from 'http';
import * as Koa from 'koa';
import * as KoaBodyParser from 'koa-bodyparser';
import * as KoaRouter from 'koa-router';

import { HighPrecisionTimer } from '../../../utils';
import { ExposedFunction, Exposer } from '../exposer';

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

    this.initialize();
  }

  expose(path: string[], func: ExposedFunction): this {
    const urlPath = `/${path.join('/')}`;

    this.router.all(urlPath, (context, next) => this.onRequest(context, next, func));

    return this;
  }

  private initialize() {
    this.koa.proxy = true;

    if (this.prefix != null) {
      this.router.prefix(this.prefix);
    }

    this.koa.use(RestExposer.responseTimeMiddleware);
    this.koa.use(this.bodyParser);
    this.koa.use(this.router.routes());
    this.koa.use(this.router.allowedMethods());

    this.server.on('request', this.koa.callback());
  }

  private async onRequest(context: KoaRouter.IRouterContext, next: () => Promise<any>, func: ExposedFunction): Promise<void> {
    const parameters = context.request.body;

    try {
      context.response.body = await func(parameters);
    }
    catch (error) {
      context.status = 500;
      throw error;
    }

    await next();
  }

  private static async responseTimeMiddleware(context: Koa.Context, next: () => Promise<any>) {
    const ms = await HighPrecisionTimer.measure(next);
    const roundedMs = Math.precisionRound(ms, 2);

    context.response.set('X-Response-Time', `${roundedMs}ms`);
  }
}
