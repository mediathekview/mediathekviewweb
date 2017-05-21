import { IFilmliste } from './interfaces/';
import { HTTPFilmliste } from './http-filmliste';
import { AsyncRequest } from './async-request';
import * as FS from 'fs';

const TIMESTAMP_PATTERN = /(\d{4})-(\d{2})-(\d{2})-filme\.xz/;

export class MVWArchiveFilmliste extends HTTPFilmliste implements IFilmliste {
  url: string;
  timestamp: number;

  constructor(url: string) {
    super(url);
    this.url = url;

    let match = this.url.match(TIMESTAMP_PATTERN);

    if (match != null) {
      let time = Date.UTC(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]));
      this.timestamp = Math.floor(time / 1000);
    }
  }

  getTimestamp(): Promise<number> {
    if (this.timestamp != undefined) {
      return Promise.resolve(this.timestamp);
    } else {
      return super.getTimestamp();
    }
  }

  pipe<T>(destination: T, options?: { end?: boolean }): T {
    return AsyncRequest.get(this.url).pipe(destination, options);
  }

  get streamIsCompressed(): Promise<boolean> {
    return Promise.resolve(true);
  }
}
