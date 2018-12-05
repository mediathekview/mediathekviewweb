import * as Needle from 'needle';
import { HttpResponse } from './response';
import { Readable } from 'stream';

export class HttpClient {
  static get(url: string): Promise<HttpResponse<Buffer>> {
    return new Promise<HttpResponse<Buffer>>((resolve, reject) => {
      Needle.get(url, (error, response) => {
        if (error) {
          return reject(error);
        }

        const result: HttpResponse<Buffer> = {
          statusCode: response.statusCode as number,
          statusMessage: response.statusMessage as string,
          body: response.raw
        };

        resolve(result);
      });
    });
  }

  static async getString(url: string): Promise<HttpResponse<string>> {
    const rawResponse = await this.get(url);
    const stringResponse: HttpResponse<string> = {
      ...rawResponse,
      body: rawResponse.body.toString()
    }

    return stringResponse;
  }

  static getStream(url: string): Readable {
    const stream = Needle.get(url);
    return stream as Readable;
  }
}
