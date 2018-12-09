import { IncomingMessage, ServerResponse } from 'http';
import { Http2ServerRequest, Http2ServerResponse } from 'http2';
import * as Koa from 'koa';
import * as KoaRouter from 'koa-router';
import { createErrorResponse } from '../common/api/rest';
import '../common/extensions/math';
import { SearchQuery } from '../common/search-engine/query';
import { Timer } from '../common/utils';
import { StreamIterableIterator } from '../utils';
import { MediathekViewWebApi } from './api';
import { SearchQueryValidator } from './validator/search-query';

type RequestHandler = (request: IncomingMessage | Http2ServerRequest, response: ServerResponse | Http2ServerResponse) => void;

const PREFIX = '/api/v2/'

export class MediathekViewWebRestApi {
  private readonly api: MediathekViewWebApi;
  private readonly koa: Koa;
  private readonly router: KoaRouter;
  private readonly searchQueryValidator: SearchQueryValidator;
  private readonly requestHandler: RequestHandler;

  constructor(api: MediathekViewWebApi) {
    this.api = api;

    this.koa = new Koa();
    this.router = new KoaRouter();
    this.searchQueryValidator = new SearchQueryValidator();

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

  private initializeRoutes() {
    this.register('/search', (context) => this.handleSearch(context));
  }

  private register(path: string, handler: (context: Koa.Context) => void) {
    this.router.post(path, async (context, next) => {
      await handler(context);
      return next();
    });
  }

  private async handleSearch(context: Koa.Context): Promise<void> {
    const { request, response } = context;

    let body: unknown;
    try {
      body = await readJsonBody(request);
    }
    catch (error) {
      console.error(error)
      response.status = 400;
      response.body = createErrorResponse((error as Error).message);
      return;
    }

    const validation = this.searchQueryValidator.validate(body);

    if (validation.valid) {
      response.body = await this.api.search(body as SearchQuery);
    } else {
      response.status = 400;
      response.body = createErrorResponse('invalid query', validation);
    }
  }
}

async function readJsonBody(request: Koa.Request, maxLength: number = 10e6): Promise<unknown> {
  const body = await readBody(request, maxLength);
  const json = JSON.parse(body);
  return json;
}

async function readBody(request: Koa.Request, maxLength: number): Promise<string> {
  const { req, charset } = request;

  const requestStream = new StreamIterableIterator<Buffer>(req);

  let totalLength: number = 0;
  const chunks: Buffer[] = [];

  for await (const chunk of requestStream) {
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

function corsMiddleware(context: Koa.Context, next: () => Promise<any>): Promise<any> {
  context.response.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': '*',
    'Access-Control-Allow-Headers': context.request.get('Access-Control-Request-Headers')
  });

  return next();
}

async function responseTimeMiddleware(context: Koa.Context, next: () => Promise<any>): Promise<void> {
  const milliseconds = await Timer.measure(next);
  const roundedMilliseconds = Math.precisionRound(milliseconds, 2);

  context.response.set('X-Response-Time', `${roundedMilliseconds}ms`);
}
