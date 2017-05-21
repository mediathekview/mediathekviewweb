import { Readable } from 'stream';
import { AsyncRequest } from './async-request';
import { IFilmliste } from './interfaces/filmliste';

export class HTTPFilmliste implements IFilmliste {
  url: string;

  constructor(url: string) {
    this.url = url;
  }

  async getTimestamp(): Promise<number> {
    let response = await AsyncRequest.head('');

    if (response.statusCode == 200 && response.headers['last-modified'] != undefined) {
      return Math.floor(new Date(response.headers['last-modified']).getTime() / 1000);
    } else if (response.statusCode != 200) {
      throw new Error(`HTTP statuscode ${response.statusCode}`);
    } else if (response.headers['last-modified'] == undefined) {

    }
  }

  getEntries(): Promise<Readable> {
    throw 'not implemented';
  }

  pipe<T>(destination: T, options?: { end?: boolean }): T {
    return AsyncRequest.get(this.url).pipe(destination, options);
  }

  get streamIsCompressed(): Promise<boolean> {
    return Promise.resolve(this.url.endsWith('xz'));
  }
}
