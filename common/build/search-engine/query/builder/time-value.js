"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TimeQueryValueBuilder {
    constructor() {
        this.offsets = [];
    }
    time(time, downRounding) {
        this._time = time;
        this.downRounding = downRounding;
        return this;
    }
    plus(value, timeUnit) {
        this.offsets.push([value, timeUnit]);
        return this;
    }
    minus(value, timeUnit) {
        this.offsets.push([-value, timeUnit]);
        return this;
    }
    build() {
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
exports.TimeQueryValueBuilder = TimeQueryValueBuilder;
