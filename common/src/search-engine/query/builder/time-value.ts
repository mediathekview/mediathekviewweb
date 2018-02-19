export type TimeUnit = 'second' | 'seconds' | 'minute' | 'minutes' | 'hour' | 'hours' | 'day' | 'days' | 'week' | 'weeks' | 'month' | 'months' | 'year' | 'years';

export class TimeQueryValueBuilder {
  private _time: 'now' | Date | null;
  private requiredPrecision: TimeUnit | null;
  private offsets: [number, TimeUnit][];

  constructor() {
    this._time = null;
    this.requiredPrecision = null;
    this.offsets = [];
  }

  time(time: 'now' | Date): TimeQueryValueBuilder;
  time(time: 'now' | Date, requiredPrecision: TimeUnit): TimeQueryValueBuilder;
  time(time: 'now' | Date, requiredPrecision: TimeUnit = 'seconds'): TimeQueryValueBuilder {
    this._time = time;
    this.requiredPrecision = requiredPrecision;

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
    if (this._time == null) {
      throw new Error('time not set');
    }

    if (!(this._time instanceof Date) && this._time != 'now') {
      throw new Error(`time must be either 'now' or an instance of Date`);
    }

    let timeString = (this._time instanceof Date) ? (Math.floor(this._time.getTime() / 1000) + '||') : this._time;

    for (let offset of this.offsets) {
      const value = offset[0];
      const timeUnit = offset[1];

      if (!Number.isFinite(value)) {
        throw new Error(`invalid number: ${value}`);
      }

      if (value != 0) {
        const sign = value < 0 ? '-' : '+';
        timeString += sign + Math.abs(value).toFixed(0) + timeUnit;
      }
    }

    timeString += '/' + this.requiredPrecision;

    return timeString;
  }
}
