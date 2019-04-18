import * as Got from 'got';
import * as Needle from 'needle';
import { Readable } from 'stream';
import { HttpResponse } from './response';

export class HttpClient {
  static async get(url: string): Promise<HttpResponse<Buffer>> {
    return new Promise<HttpResponse<Buffer>>((resolve, reject) => {
      Needle.get(url, { follow: 3 }, (error, response) => {
        if (error != undefined) {
          reject(error);
          return;
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

  static async getString(url: string): Promise<string> {
    const response = await Got.get(url, { followRedirect: true });
    return response.body;
  }

  static getStream(url: string): Readable {
    const stream = Needle.get(url, { follow: 3 });
    return stream as Readable;
  }
}
