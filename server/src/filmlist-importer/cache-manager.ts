import * as FS from '../async-fs';
import * as OS from 'os';
import { Stream, Readable, Writable } from 'stream';
import * as Path from 'path';
import * as Crypto from 'crypto';

export class CacheManager {
  private directory: string;
  private tempDirectory: string;

  constructor(private dataDirectory: string) {
    this.directory = Path.join(this.dataDirectory, 'cache');
    this.tempDirectory = Path.join(this.dataDirectory, 'cache', 'temp', process.pid.toString());
    //this.tempDirectory = Path.join(OS.tmpdir(), 'mediathekviewweb', process.pid.toString());
  }

  private hash(ressource: string): string {
    return Crypto.createHash('sha1').update(ressource).digest('base64').slice(0, -2);
  }

  private getTempPath(ressource: string): string {
    return Path.join(this.tempDirectory, this.hash(ressource));
  }

  private getPath(ressource: string): string {
    return Path.join(this.dataDirectory, this.hash(ressource));
  }

  async has(ressource: string): Promise<boolean> {
    const path = this.getPath(ressource);
    return FS.exists(path);
  }

  get(ressource: string): Readable {
    const path = this.getPath(ressource);
    return FS.createReadStream(path, { autoClose: true, flags: 'r' });
  }

  async set(ressource: string, stream: Stream): Promise<void> {
    const tempPath = this.getTempPath(ressource);
    const path = this.getPath(ressource);

    await FS.createDirectory(this.tempDirectory);
    const directoryCreationPromise = FS.createDirectory(this.directory);

    const fileStream = FS.createWriteStream(tempPath, { autoClose: true, flags: 'w' });

    return new Promise<void>((resolve, reject) => {
      fileStream.on('finish', async () => {
        await directoryCreationPromise;
        await FS.rename(tempPath, path);
        resolve();
      });

      fileStream.on('error', (error) => {
        reject(error);
      });

      stream.pipe(fileStream);
    });
  }
}
