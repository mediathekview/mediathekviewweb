import { IFile } from './listing-interface';
import { Stream } from 'stream';
import * as Needle from 'needle';
import { Nullable } from '../../utils';

const NAME_REGEX = /\/([^\/]+$)/;

export class HttpFile implements IFile {
  private _fetch: Nullable<Promise<void>> = null;
  private _timestamp: Nullable<number> = null;
  private _size: Nullable<number> = null;

  ressource: string;
  cacheable: boolean;
  name: string;

  constructor(private url: string, timestamp: Nullable<number> = null, size: Nullable<number> = null, cachable: boolean = false) {
    this.ressource = url;
    this.cacheable = cachable;
    if (timestamp != null) this._timestamp = timestamp;
    if (size != null) this._size = size;

    const nameMatch = url.match(NAME_REGEX);

    if (nameMatch != null) {
      this.name = nameMatch[1];
    } else {
      throw new Error(`couldn't parse filename from url ${url}`);
    }
  }

  private fetch(): Promise<void> {
    if (this._fetch != null) {
      return this._fetch;
    }

    this._fetch = new Promise<void>((resolve, reject) => {
      Needle.head(this.url, (error, response) => {
        if (error) {
          return reject(error);
        }

        if (response.statusCode != 200) {
          return reject(new Error(`StatusCode ${response.statusCode}: ${response.statusMessage}`));
        }

        const lastModified = response.headers['last-modified'] as string;
        if (lastModified != undefined) {
          var parsed = new Date(lastModified);
          this._timestamp = Math.floor(parsed.getTime() / 1000);
        }

        const contentLength = response.headers['content-length'] as string;
        if (contentLength != undefined) {
          this._size = parseInt(contentLength);
        }

        resolve();
      });
    });

    return this._fetch;
  }

  async getTimestamp(): Promise<Nullable<number>> {
    if (this._timestamp != null) {
      return this._timestamp;
    }

    await this.fetch();

    return this._timestamp;
  }

  async getSize(): Promise<Nullable<number>> {
    if (this._size != null) {
      return this._size;
    }

    await this.fetch();
    return this._size;
  }

  getStream(): Stream {
    return Needle.get(this.url);
  }
}
