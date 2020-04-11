import * as Got from 'got';
import { Readable } from 'stream';
import { HttpResponse } from './response';

type GotOptions = Got.GotOptions<null> & { responseType?: 'text' | 'json' | 'buffer' };

const gotOptions: GotOptions = {
  retry: 0,
  followRedirect: true
};

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class HttpClient {
  static async get(url: string): Promise<HttpResponse<Buffer>> {
    const response = await Got.get(url, { ...gotOptions, responseType: 'buffer' } as GotOptions);

    const result: HttpResponse<Buffer> = {
      statusCode: response.statusCode,
      statusMessage: response.statusMessage,
      body: response.body as any as Buffer
    };

    return result;
  }

  static async getString(url: string): Promise<string> {
    const response = await Got.get(url, gotOptions);
    return response.body;
  }

  static getStream(url: string): Readable {
    const stream = Got.stream.get(url, gotOptions)
    return stream;
  }
}
