import { UnitStringParser, Unit } from './unit-string';


const UNITS: Unit[] = [
    { pattern: /^s(e(c(o(n(d(s)?)?)?)?)?)$/, factor: 1 },
    { pattern: /^m(i(n(u(t(e(s)?)?)?)?)?)$/, factor: 60 },
    { pattern: /^h(o(u(r(s)?)?)?)$/, factor: 60 * 60 }
];

export class TimeStringParser extends UnitStringParser {
    constructor() {
        super(UNITS);
    }
}
