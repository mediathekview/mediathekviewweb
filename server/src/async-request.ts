import * as request from 'request';

export type Response = request.RequestResponse;

export class AsyncRequest {
  static get(url: string): Promise<Response> {
    return this.asyncRequest(request.get, '');
  }

  static head(url: string):Promise<Response> {
    return this.asyncRequest(request.head, '');
  }

  private static asyncRequest(func: (url: string, callback: (error: any, response: request.RequestResponse, body: string) => void) => request.Request, url: string) :Promise<Response>{
    return new Promise<Response>((resolve, reject) => {
      func(url, (error, response, body) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }
}
