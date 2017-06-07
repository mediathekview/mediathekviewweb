import * as Crypto from 'crypto';
import * as Path from 'path';
import { AsyncFS } from './async-fs';

const CACHE_DIR = Path.join(__dirname, './data/cache/');

export class Cache {
  path: string;
  mkdirPromise: Promise<void>;

  constructor(path: string) {
    this.path = path;
  }

  private async mkdir() {
    if (this.mkdirPromise == undefined) {
      this.mkdirPromise = AsyncFS.mkdir(CACHE_DIR, true);
    }

    return this.mkdirPromise;
  }

  async has(): Promise<boolean> {
    await this.mkdir();
    return AsyncFS.access(this.path);
  }

  async clear(): Promise<void> {
    await this.mkdir();
    return AsyncFS.unlink(this.path);
  }
}

export class CacheManager {
  static get(key: string): Cache {
    return new Cache(CACHE_DIR + Crypto.createHash('md5').update(key).digest('hex'));
  }
}
