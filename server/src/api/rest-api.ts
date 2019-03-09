import { IncomingMessage, ServerResponse } from 'http';
import { Http2ServerRequest, Http2ServerResponse } from 'http2';
import * as Koa from 'koa';
import * as KoaRouter from 'koa-router';
import { createErrorResponse, createResultResponse } from '../common/api/response';
import { Logger } from '../common/logger';
import { precisionRound, Timer } from '../common/utils';
import { readStream } from '../utils';
import { ValidationFunction } from '../validator';

type RequestHandler = (request: IncomingMessage | Http2ServerRequest, response: ServerResponse | Http2ServerResponse) => void;
type FunctionHandler<TParameters, TResult> = (parameters: TParameters) => Promise<TResult>;

const PREFIX = '/api/v2';

export class RestApi {
  private readonly logger: Logger;
  private readonly koa: Koa<void, void>;
  private readonly router: KoaRouter<void, void>;
  private readonly requestHandler: RequestHandler;

  constructor(logger: Logger) {
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
  }

  registerGetRoute<TParameters, TResult>(path: string, validator: ValidationFunction<TParameters>, handler: FunctionHandler<TParameters, TResult>): void {
    this.router.get(path, async (context, next) => {
      await this.handle(context, validator, handler);
      return next();
    });
  }

  registerPostRoute<TParameters, TResult>(path: string, validator: ValidationFunction<TParameters>, handler: FunctionHandler<TParameters, TResult>): void {
    this.router.post(path, async (context, next) => {
      await this.handle(context, validator, handler);
      return next();
    });
  }

  private async handle<TBody, TResult>(context: Koa.Context, validator: ValidationFunction<TBody>, handler: FunctionHandler<TBody, TResult>): Promise<void> {
    const { request, response } = context;

    let parameters: unknown;
    try {
      switch (request.method) {
        case 'get':
          parameters = request.query;
          break;

        case 'post':
          parameters = await readJsonBody(request);
          break;

        default:
          throw new Error('method not supported');
      }
    }
    catch (error) {
      response.status = 400;
      response.body = createErrorResponse((error as Error).message);
      return;
    }

    if (validator(parameters)) {
      try {
        const result = await handler(parameters);
        response.body = createResultResponse(result);
      }
      catch (error) {
        this.logger.error(error as Error);
        response.status = 500;
        response.body = createErrorResponse('server error', { name: (error as Error).name, message: (error as Error).message });
      }
    }
    else {
      response.status = 400;
      response.body = createErrorResponse('invalid parameters', validator.errors);
    }
  }
}

async function readJsonBody(request: Koa.Request, maxLength: number = 10e6): Promise<unknown> {
  const body = await readBody(request, maxLength);
  const json = JSON.parse(body) as unknown;
  return json;
}

async function readBody(request: Koa.Request, maxBytes: number): Promise<string> {
  const { req, charset } = request;

  const rawBody = await readStream(req, maxBytes);
  const encoding = (charset != undefined && charset.length > 0) ? charset : 'utf-8';
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
