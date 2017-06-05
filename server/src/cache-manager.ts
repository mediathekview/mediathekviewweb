import * as Crypto from 'crypto';
import { AsyncFS } from './async-fs';

const CACHE_DIR = './data/cache/http-filmliste/';

export class Cache {
  path: string;

  constructor(path: string) {
    this.path = path;
  }

  has(): Promise<boolean> {
    return AsyncFS.access(this.path);
  }

  clear(): Promise<void> {
    return AsyncFS.unlink(this.path);
  }
}

export class CacheManager {
  static get(key: string): Cache {
    return new Cache(CACHE_DIR + Crypto.createHash('md5').update(key).digest('hex'));
  }
}
