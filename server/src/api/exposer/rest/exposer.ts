import { IncomingMessage, ServerResponse } from 'http';
import * as Koa from 'koa';
import * as KoaBodyParser from 'koa-bodyparser';
import * as KoaRouter from 'koa-router';
import * as KoaSend from 'koa-send';
import * as Path from 'path';

import { Timer } from '../../../common/utils';
import { ExposedFunction, Exposer } from '../exposer';

export class RestExposer implements Exposer {
  private readonly prefix: string | null;
  private readonly koa: Koa;
  private readonly router: KoaRouter;
  private readonly bodyParser: Koa.Middleware;
  private requestHandler: (req: IncomingMessage, res: ServerResponse) => void;

  constructor();
  constructor(prefix: string);
  constructor(prefix: string | null = null) {
    this.prefix = prefix;

    this.koa = new Koa();
    this.router = new KoaRouter();
    this.bodyParser = KoaBodyParser();

    this.initialize();
  }

  expose<T>(path: string[], func: ExposedFunction<T>): this {
    const urlPath = `/${path.join('/')}`;

    this.router.all(urlPath, (context, next) => this.onRequest(context, next, func));

    return this;
  }

  handleRequest(request: IncomingMessage, response: ServerResponse) {
    this.requestHandler(request, response);
  }

  private initialize() {
    this.koa.proxy = true;

    if (this.prefix != null) {
      this.router.prefix(this.prefix);
    }

    this.koa.use(RestExposer.responseTimeMiddleware);
    this.koa.use(RestExposer.corsMiddleware);
    this.koa.use(this.bodyParser);
    this.koa.use(this.router.routes());
    this.koa.use(this.router.allowedMethods());

    this.requestHandler = this.koa.callback();

    this.exposeClient();
  }

  private exposeClient() {
    const clientRoot = Path.resolve(__dirname, '../../../../../client/dist/');
    const indexHtml = Path.resolve(clientRoot, 'index.html');

    this.koa.use(async (context, next) => {
      if (context.path.startsWith('/api')) {
        await next();
      } else {
        await KoaSend(context, context.path, { root: clientRoot, index: 'index.html' });
      }
    });
  }

  private async onRequest<T>(context: KoaRouter.IRouterContext, next: () => Promise<any>, func: ExposedFunction<T>): Promise<void> {
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

  private static corsMiddleware(context: Koa.Context, next: () => Promise<any>): Promise<any> {
    context.response.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': context.request.get('Access-Control-Request-Headers')
    });
    return next();
  }

  private static async responseTimeMiddleware(context: Koa.Context, next: () => Promise<any>): Promise<void> {
    const ms = await Timer.measure(next);
    const roundedMs = Math.precisionRound(ms, 2);

    context.response.set('X-Response-Time', `${roundedMs}ms`);
  }
}
