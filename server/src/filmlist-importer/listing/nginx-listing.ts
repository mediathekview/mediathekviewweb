import * as URL from 'url';
import * as Needle from 'needle';
import { IListing, IFile } from './listing-interface';
import { HttpFile } from './http-file';

const PARSE_REGEX = /^<a\s+href="(.*?)"\s?>(.*?)<\/a>\s*(\S+)\s+(\S+)/gm;

export class NginxListing implements IListing {
  private listings: IListing[] | null = null;
  private files: IFile[] | null = null;

  private _fetch: Promise<void> | null = null;

  constructor(private url: string) { }

  private fetch() {
    if (this._fetch != null) {
      return this._fetch;
    }

    this._fetch = new Promise<void>((resolve, reject) => {
      Needle.get(this.url, (error, response) => {
        if (error) {
          return reject(error);
        }

        if (response.statusCode != 200) {
          return reject(new Error(`StatusCode ${response.statusCode}: ${response.statusMessage}`));
        }

        this.parseBody(response.body);

        resolve();
      });
    });

    return this._fetch;
  }

  private parseBody(body: string) {
    let matches: RegExpExecArray[] = [];

    let match: RegExpExecArray | null;
    while ((match = PARSE_REGEX.exec(body)) !== null) {
      matches.push(match);
    }

    const listings: NginxListing[] = [];
    const files: HttpFile[] = [];

    for (let match of matches) {
      const url = URL.resolve(this.url, match[1]);

      if (url.endsWith('/')) {
        listings.push(new NginxListing(url));
      } else {
        const date = new Date(Date.parse(match[3] + ' ' + match[4]));
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        const timestamp = date.getTime() / 1000;

        files.push(new HttpFile(url, timestamp));
      }
    }

    this.listings = listings;
    this.files = files;
  }

  async getListings(recursive?: boolean): Promise<IListing[]> {
    await this.fetch();

    if (this.listings == null) {
      throw new Error('listings is null, something went wrong');
    }

    let listings = this.listings;

    if (recursive) {
      for (let listing of this.listings) {
        let subListings = await listing.getListings(true);
        listings = listings.concat(subListings);
      }
    }

    return listings;
  }


  async getFiles(recursive?: boolean): Promise<IFile[]> {
    await this.fetch();

    if (this.files == null) {
      throw new Error('files is null, something went wrong');
    }

    let files = this.files;

    if (recursive) {
      if (this.listings == null) {
        throw new Error('listings is null, something went wrong');
      }

      for (let listing of this.listings) {
        let subFiles = await listing.getFiles(true);
        files = files.concat(subFiles);
      }
    }

    return files;
  }
}
