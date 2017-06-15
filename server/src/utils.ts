import * as Stream from 'stream';

const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];
const BYTE_MULTIPLIER = 1000;

export class Utils {
  static parseIntAsync(number: string): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      resolve(parseInt(number, 10));
    });
  }

  static parseFloatAsync(number: string): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      resolve(parseFloat(number));
    });
  }

  static formatBytes(bytes: number): string {
    if (bytes == undefined || bytes == null) {
      return null;
    }
    if (bytes <= 1) {
      if (bytes < 0) {
        return null;
      } else {
        return `${bytes} Byte`;
      }
    }

    let dimension = Math.floor(Math.log10(bytes) / Math.log10(BYTE_MULTIPLIER));
    let result = (bytes / Math.pow(BYTE_MULTIPLIER, dimension)).toFixed(2);

    return `${result} ${BYTE_UNITS[dimension]}`;
  }

  static arrayize<T>(obj: T | T[]): T[] {
    if (Array.isArray(obj)) {
      return obj;
    } else {
      return [obj];
    }
  }

  static getProperty<T>(obj: any, property: string | string[]): T {
    if (property == null || property == undefined) {
      return obj;
    }

    let propertySplit = Array.isArray(property) ? property : property.split('.').filter((prop) => prop.length > 0);

    if (propertySplit.length == 0) {
      return obj;
    }

    let item = obj[propertySplit[0]];
    for (let i = 1; i < propertySplit.length; i++) {
      item = item[propertySplit[i]];
    }

    return item;
  }  

  static streamToPromise(stream: Stream.Writable | Stream.Readable): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (stream instanceof Stream.Writable) {
        stream.on('finish', () => resolve());
      } else if (stream instanceof Stream.Readable) {
        stream.on('end', () => resolve());
      } else {
        throw new Error('stream type not supported');
      }


      stream.on('error', (error) => reject(error));
    });
  }

  static promiseTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
    return new Promise<T>(async (resolve, reject) => {
      let timedOut = false;
      let resolved = false;

      let timeoutHandle = setTimeout(() => {
        if (resolved) {
          return;
        }

        timedOut = true;
        reject();
      }, timeout);

      let result = await promise;
      resolved = true;

      if (timedOut) {
        return;
      }
      resolve(result);
    });
  }
}
