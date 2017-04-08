import * as Moment from 'moment';

const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];
const BYTE_MULTIPLIER = 1000;

export class Utils {
  static currentInstanceID = 0;

  static getInstanceID(): number {
    return this.currentInstanceID++;
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

  static getDate(timestamp: number): string {
    return Moment.unix(timestamp).format('DD.MM.YYYY');
  }

  static getTime(timestamp: number): string {
    return Moment.unix(timestamp).format('HH:mm');
  }
}
