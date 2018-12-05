import * as Koa from 'koa';
import * as KoaRouter from 'koa-router';
import '../common/extensions/math';
import { SearchQuery } from '../common/search-engine/query';
import { Timer } from '../common/utils';
import { StreamIterable } from '../utils';
import { MediathekViewWebApi } from './api';
import { SearchQueryValidator } from './validator/search-query';

const PREFIX = '/api/v2/'

export class MediathekViewWebRestApi {
  private readonly api: MediathekViewWebApi;
  private readonly port: number;
  private readonly koa: Koa;
  private readonly router: KoaRouter;
  private readonly searchQueryValidator: SearchQueryValidator;

  constructor(api: MediathekViewWebApi, port: number) {
    this.api = api;
    this.port = port;

    this.koa = new Koa();
    this.router = new KoaRouter();
    this.searchQueryValidator = new SearchQueryValidator();
  }

  initialize(): void {
    this.koa.proxy = true;
    this.router.prefix(PREFIX);

    this.koa.use(responseTimeMiddleware);
    this.koa.use(this.router.routes());
    this.koa.use(this.router.allowedMethods());

    this.koa.listen(this.port);
  }

  initializeRoutes() {
    this.register('search', (request, response) => this.search(request, response));
  }

  register(path: string, handler: (request: Koa.Request, response: Koa.Response) => void) {
    this.router.get(path, async ({ request, response }, next) => {
      await handler(request, response);
      return next();
    });
  }

  async search(request: Koa.Request, response: Koa.Response) {
    const body = await readJsonBody(request);
    const validation = this.searchQueryValidator.validate(body);

    if (validation.valid) {
      response.body = await this.api.search(body as SearchQuery);
    } else {
      response.status = 400;
      response.body = validation;
    }
  }
}

async function readJsonBody(request: Koa.Request, maxLength: number = 10e6): Promise<unknown> {
  const body = await readBody(request, maxLength);
  const json = JSON.parse(body);

  return json;
}

async function readBody(request: Koa.Request, maxLength: number): Promise<string> {
  const requestStream = new StreamIterable<Buffer>(request.req);

  let totalLength: number = 0;
  const chunks: Buffer[] = [];

  for await (const chunk of requestStream) {
    chunks.push(chunk);
    totalLength += chunk.length;

    if (totalLength >= maxLength) {
      request.req.destroy(new Error('maximum body size exceeded'));
    }
  }

  const encoding = request.charset;
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
