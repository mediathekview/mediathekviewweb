import * as FS from 'fs';

export class AsyncFSFlags {
  static ReadExist = 'r';
  static ReadWriteExist = 'r+';
  static ReadWriteExistSync = 'rs+';
  static WriteCreateOrTruncate = 'w';
  static WriteNonExist = 'wx';
  static ReadWriteCreateOrTruncate = 'w+';
  static ReadWriteNonExist = 'wx+';
  static AppendCreate = 'a';
  static AppendExist = 'ax';
  static ReadAppendCreate = 'a+';
  static ReadAppendExist = 'ax+';
}

export class AsyncFS {
  static Flags = AsyncFSFlags;

  static open(path: string, flags: string): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      FS.open(path, flags, (error, fd) => {
        if (error) {
          reject(error);
        } else {
          resolve(fd);
        }
      });
    });
  }

  static close(fd: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      FS.close(fd, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  //static createWriteStream = FS.createWriteStream;

  static async createWriteStream(path: string | Buffer, options: { flags?: string, encoding?: string, fd?: number, mode?: number, autoClose?: boolean, start?: number }): Promise<FS.WriteStream> {
    return FS.createWriteStream(path, options);
  }

  static stat(pathOrFd: string | number): Promise<FS.Stats> {
    return new Promise<FS.Stats>((resolve, reject) => {
      let callbackFunction = (error, stats: FS.Stats) => {
        if (error) {
          reject(error);
        } else {
          resolve(stats);
        }
      }

      switch (typeof pathOrFd) {
        case 'string':
          FS.stat((pathOrFd as string), callbackFunction);
          break;
        case 'number':
          FS.fstat((pathOrFd as number), callbackFunction);
          break;
        default:
          throw new Error('invalid type for "pathOrFd"');
      }
    });
  }

  static access(path: string, mode: number = FS.constants.F_OK): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      FS.access(path, mode, (error) => {
        resolve(!!error);
      });
    });
  }

  static unlink(path: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      FS.unlink(path, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }
}
