import * as Needle from 'needle';
import { HttpResponse } from './response';
import { Readable } from 'stream';

export class HttpClient {
    static get(url: string): Promise<HttpResponse> {
        return new Promise<HttpResponse>((resolve, reject) => {
            Needle.get(url, (error, response) => {
                if (error) {
                    return reject(error);
                }

                const body = response.raw.toString();
                const result: HttpResponse = {
                    statusCode: response.statusCode as number,
                    statusMessage: response.statusMessage as string,
                    body: body
                };

                resolve(result);
            });
        });
    }

    static getStream(url: string): Readable {
        const stream = Needle.get(url);
        return stream as Readable;
    }
}