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
      var lastModified = Math.floor(new Date(response.headers['last-modified']).getTime() / 1000);
      resolve(lastModified);
    } else if (response.statusCode != 200) {
      reject(new Error(`statuscode ${response.statusCode}`));
    } else if (response.headers['last-modified'] == undefined) {
      reject(new Error(`no 'last-modified' header in response`));
    }
  }

  getEntries(): Promise<Readable> {
    throw 'not implemented';
  }
}
