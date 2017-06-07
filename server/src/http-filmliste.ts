import { Observable, Subscriber } from 'rxjs';
import { AsyncRequest } from './async-request';
import * as LZMA from 'lzma-native';
import { IFilmliste, BatchType } from './interfaces/filmliste';
import { AsyncFS } from './async-fs';
import { Entry } from './model';
import { CacheManager } from './cache-manager';
import { Utils } from './utils';
import { NativeFilmlisteParser, BatchCallbackType } from './native-filmliste-parser';

export class HTTPFilmliste implements IFilmliste {
  url: string;
  cachable: boolean;
  timestamp: number;

  constructor(url: string, cachable: boolean) {
    this.url = url;
    this.cachable = cachable;
  }

  async getTimestamp(): Promise<number> {
    if (this.timestamp != undefined) {
      return this.timestamp;
    }

    let response = await AsyncRequest.head(this.url);

    if (response.statusCode == 200 && response.headers['last-modified'] != undefined) {
      this.timestamp = Math.floor(new Date(response.headers['last-modified']).getTime() / 1000);
    } else if (response.statusCode != 200) {
      throw new Error(`HTTP statuscode ${response.statusCode}`);
    } else if (response.headers['last-modified'] == undefined) {
      throw new Error(`No Last-Modified Header from ${this.url}`);
    }

    return this.timestamp;
  }

  private

  getEntries(): Observable<BatchType> {
    console.log('getEntries');
    let observable: Observable<BatchType> = new Observable<BatchType>((observer) => {
      this.observerHandler(observer);
    });

    return observable;
  }

  private async observerHandler(observer: Subscriber<BatchType>) {
    console.log('observerHandler');
    let cache = CacheManager.get(this.url);

    let has = await cache.has();
    if (!has) {
      let fd = await AsyncFS.open(cache.path, AsyncFS.Flags.WriteNonExist);

      let fileStream = await AsyncFS.createWriteStream(null, { fd: fd, autoClose: false });

      await Utils.streamToPromise(await this.pipe(fileStream));

      await AsyncFS.close(fd);
    }

    await NativeFilmlisteParser.parseFilmliste(cache.path, '({|,)?"(Filmliste|X)":', 150, (batch, next) => observer.next({ data: batch, next: next }));

    observer.complete();
  }

  async pipe<T>(destination: T, options?: { end?: boolean }): Promise<T> {
    if (await this.streamIsCompressed) {
      let decompressor = LZMA.createDecompressor();
      return AsyncRequest.get(this.url).pipe(decompressor).pipe(destination, options);
    } else {
      return AsyncRequest.get(this.url).pipe(destination, options);
    }
  }

  get streamIsCompressed(): Promise<boolean> {
    return Promise.resolve(this.url.endsWith('xz'));
  }
}
