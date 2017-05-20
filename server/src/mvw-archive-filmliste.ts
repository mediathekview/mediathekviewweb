import { IFilmliste } from './interfaces/';
import { HTTPFilmliste } from './http-filmliste';

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
}
