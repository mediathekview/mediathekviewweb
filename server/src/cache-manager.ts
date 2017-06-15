import * as Crypto from 'crypto';
import * as Path from 'path';
import * as FS from 'fs';
import { AsyncFS } from './async-fs';

const CACHE_DIR = Path.join(__dirname, './data/cache/');

export class Cache {
  path: string;
  private tmpPath: string;
  private mkdirPromise: Promise<void>;
  private fd: number = null;

  constructor(directory: string, filename: string) {
    this.path = Path.join(directory, filename);
    this.tmpPath = Path.join(directory, 'unfinished_' + filename);
  }

  private async mkdir() {
    if (this.mkdirPromise == undefined) {
      this.mkdirPromise = AsyncFS.mkdir(CACHE_DIR, true);
    }

    return this.mkdirPromise;
  }

  async getWriteStream(): Promise<FS.WriteStream> {
    if (this.fd != null) {
      throw new Error('need to finalize before calling getWriteStream again');
    }

    await this.mkdir();

    let fd = await AsyncFS.open(this.tmpPath, AsyncFS.Flags.WriteCreateOrTruncate);
    let fileStream = await AsyncFS.createWriteStream(null, { fd: fd, autoClose: false });
    this.fd = fd;

    return fileStream;
  }

  async finalize() {
    if (this.fd == null) {
      throw new Error('need to getWriteStream before calling finalize');
    }

    await AsyncFS.close(this.fd);
    await AsyncFS.rename(this.tmpPath, this.path);
    this.fd = null;
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
    return new Cache(CACHE_DIR, Crypto.createHash('md5').update(key).digest('hex'));
  }
}
