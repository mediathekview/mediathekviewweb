import { IncomingMessage, ServerResponse } from 'http';
import { Http2ServerRequest, Http2ServerResponse } from 'http2';
import * as Koa from 'koa';
import * as KoaRouter from 'koa-router';
import { createErrorResponse } from '../common/api/rest';
import { Logger } from '../common/logger';
import { precisionRound, Timer } from '../common/utils';
import { StreamIterable } from '../utils';
import { validateSearchQuery, validateTextSearchQuery, ValidationFunction } from '../validator';
import { MediathekViewWebApi } from './api';

type RequestHandler = (request: IncomingMessage | Http2ServerRequest, response: ServerResponse | Http2ServerResponse) => void;
type FunctionHandler<Body, Result> = (request: Koa.Request, response: Koa.Response, body: Body) => Promise<Result>;

const PREFIX = '/api/v2/';

export class MediathekViewWebRestApi {
  private readonly api: MediathekViewWebApi;
  private readonly logger: Logger;
  private readonly koa: Koa<void, void>;
  private readonly router: KoaRouter<void, void>;
  private readonly requestHandler: RequestHandler;

  constructor(api: MediathekViewWebApi, logger: Logger) {
    this.api = api;
    this.logger = logger;

    this.koa = new Koa();
    this.router = new KoaRouter();

    this.requestHandler = this.koa.callback();

    this.initialize();
  }

  handleRequest(request: IncomingMessage | Http2ServerRequest, response: ServerResponse | Http2ServerResponse): void {
    this.requestHandler(request, response);
  }

  private initialize(): void {
    this.koa.proxy = true;
    this.router.prefix(PREFIX);

    this.koa.use(responseTimeMiddleware);
    this.koa.use(this.router.routes());
    this.koa.use(this.router.allowedMethods());

    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.registerPostRoute('/entries/search', async (context) => await this.handle(context, validateSearchQuery, async (_request, _response, body) => this.api.search(body)));
    this.registerPostRoute('/entries/search/text', async (context) => await this.handle(context, validateTextSearchQuery, async (_request, _response, body) => this.api.textSearch(body)));
  }

  private registerPostRoute(path: string, handler: (context: Koa.Context) => Promise<void>): void {
    this.router.post(path, async (context, next) => {
      await handler(context);
      return next();
    });
  }

  private async handle<Body, Result>(context: Koa.Context, validator: ValidationFunction<Body>, handler: FunctionHandler<Body, Result>): Promise<void> {
    const { request, response } = context;

    let body: unknown;
    try {
      body = await readJsonBody(request);
    }
    catch (error) {
      response.status = 400;
      response.body = createErrorResponse((error as Error).message);
      return;
    }

    if (validator(body)) {
      try {
        await handler(request, response, body);
      }
      catch (error) {
        response.status = 400;
        response.body = createErrorResponse('server error', { name: (error as Error).name, message: (error as Error).message });
      }
    }
    else {
      response.status = 400;
      response.body = createErrorResponse('invalid body', validator.errors);
    }
  }
}

async function readJsonBody(request: Koa.Request, maxLength: number = 10e6): Promise<unknown> {
  const body = await readBody(request, maxLength);
  const json = JSON.parse(body) as unknown;
  return json;
}

async function readBody(request: Koa.Request, maxLength: number): Promise<string> {
  const { req, charset } = request;

  const requestStream = new StreamIterable<Buffer>(req);

  let totalLength: number = 0;
  const chunks: Buffer[] = [];

  for await (const chunk of requestStream) { // tslint:disable-line: await-promise
    chunks.push(chunk);
    totalLength += chunk.length;

    if (totalLength >= maxLength) {
      request.req.destroy(new Error('maximum body size exceeded'));
    }
  }

  const encoding = (charset != undefined && charset.length > 0) ? charset : 'utf-8';
  const rawBody = Buffer.concat(chunks, totalLength);
  const body = rawBody.toString(encoding);

  return body;
}

async function corsMiddleware(context: Koa.Context, next: () => Promise<any>): Promise<any> {
  context.response.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': '*',
    'Access-Control-Allow-Headers': context.request.get('Access-Control-Request-Headers')
  });

  return next();
}

async function responseTimeMiddleware(context: Koa.Context, next: () => Promise<any>): Promise<void> {
  const milliseconds = await Timer.measureAsync(next);
  const roundedMilliseconds = precisionRound(milliseconds, 2);

  context.response.set('X-Response-Time', `${roundedMilliseconds}ms`);
}
