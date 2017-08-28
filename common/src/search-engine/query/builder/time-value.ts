export type TimeUnit = 'second' | 'seconds' | 'minute' | 'minutes' | 'hour' | 'hours' | 'day' | 'days' | 'week' | 'weeks' | 'month' | 'months' | 'year' | 'years';

export class TimeQueryValueBuilder {
  private _time: 'now' | Date;
  private downRounding: TimeUnit;
  private offsets: [number, TimeUnit][] = [];

  time(time: 'now' | Date, downRounding: TimeUnit): TimeQueryValueBuilder {
    this._time = time;
    this.downRounding = downRounding;

    return this;
  }

  plus(value: number, timeUnit: TimeUnit): TimeQueryValueBuilder {
    this.offsets.push([value, timeUnit]);

    return this;
  }

  minus(value: number, timeUnit: TimeUnit): TimeQueryValueBuilder {
    this.offsets.push([-value, timeUnit]);

    return this;
  }

  build(): string {
    if (!(this._time instanceof Date) && this._time != 'now') {
      throw new Error(`Invalid date. Must be either 'now' or an instance of Date.`);
    }

    let timeString = (this._time instanceof Date) ? (Math.floor(this._time.getTime() / 1000) + '||') : this._time;

    for (let offset of this.offsets) {
      const value = offset[0];
      const timeUnit = offset[1];

      if (!Number.isFinite(value)) {
        throw new Error('Invalid number: ' + value);
      }

      if (value != 0) {
        const sign = value < 0 ? '-' : '+';
        timeString += sign + Math.abs(value).toFixed(0) + timeUnit;
      }
    }

    timeString += '/' + this.downRounding;

    return timeString;
  }
}
