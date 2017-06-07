import * as Stream from 'stream';
import * as Request from 'request';

export type Response = Request.RequestResponse;

export interface IPipeablePromise<T> extends Promise<T> {
  pipe<T2 extends Stream.Writable>(destination: T2, options?: { end?: boolean }): T2;
}

export class PipeablePromise<T> extends Promise<T> implements IPipeablePromise<T> {
  private pipeFunction: (destination: any, options?: { end?: boolean }) => any;

  setPipeFunction(pipeFunction: (destination: any, options?: { end?: boolean }) => any, binding: any) {
    this.pipeFunction = pipeFunction.bind(binding);
  }

  pipe<T2>(destination: T2, options?: { end?: boolean }): T2 {
    return this.pipeFunction(destination, options);
  }
}

export class AsyncRequest {
  static get(url: string): PipeablePromise<Response> {
    return this.asyncRequest(Request.get, url);
  }

  static head(url: string): PipeablePromise<Response> {
    return this.asyncRequest(Request.head, url);
  }

  private static asyncRequest(func: (url: string, callback: (error: any, response: Request.RequestResponse, body: string) => void) => Request.Request, url: string): PipeablePromise<Response> {
    let request: Request.Request;

    let pipeablePromise = new PipeablePromise<Response>((resolve, reject) => {
      request = func(url, (error, response, body) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
    pipeablePromise.setPipeFunction(request.pipe, request);

    return pipeablePromise;
  }
}
