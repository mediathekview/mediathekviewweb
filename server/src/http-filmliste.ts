import { Observable } from 'rxjs';
import { AsyncRequest } from './async-request';
import { IFilmliste } from './interfaces/filmliste';
import { Entry } from './model';
import { NativeFilmlisteParser } from './native-filmliste-parser';

export class HTTPFilmliste implements IFilmliste {
  url: string;

  constructor(url: string) {
    this.url = url;
  }

  async getTimestamp(): Promise<number> {
    let response = await AsyncRequest.head(this.url);

    if (response.statusCode == 200 && response.headers['last-modified'] != undefined) {
      return Math.floor(new Date(response.headers['last-modified']).getTime() / 1000);
    } else if (response.statusCode != 200) {
      throw new Error(`HTTP statuscode ${response.statusCode}`);
    } else if (response.headers['last-modified'] == undefined) {
      throw new Error(`No Last-Modified Header from ${this.url}`);
    }
  }

  getEntries(): Observable<Entry[]> {
    let observable: Observable<Entry[]> = new Observable<Entry[]>((observer) => {
      (async () => {
        NativeFilmlisteParser.parseFilmliste('', '', 100, (batch) => {
          observer.next(batch);
        }, () => {
          observer.complete();
        });
      })();
    });

    return observable;
  }

  pipe<T>(destination: T, options?: { end?: boolean }): T {
    return AsyncRequest.get(this.url).pipe(destination, options);
  }

  get streamIsCompressed(): Promise<boolean> {
    return Promise.resolve(this.url.endsWith('xz'));
  }
}
