export interface IMapper<T> {
  map(value: T): any;
  reverse(value: any): T;
}

export abstract class Mapper {
  source: string;
  destination: string;

  constructor(source: string, destination: string) {
    this.source = source;
    this.destination = destination;
  }
}

export class StringMapper extends Mapper implements IMapper<string> {
  constructor(options: { source: string, dest?: string }) {
    super(options.source, options.dest);
  }

  map(value: any): any {
    return value;
  }

  reverse(value: any): any {
    return value;
  }
}

export class IntMapper extends Mapper implements IMapper<number> {
  maxDigits: number;

  constructor(options: { source: string, dest?: string, maxDigits: number }) {
    super(options.source, options.dest);

    this.maxDigits = options.maxDigits;
  }

  map(value: number): string {
    return this.leftPad(value, this.maxDigits);
  }

  reverse(value: string): number {
    return parseInt(value);
  }

  private leftPad(value: number, length: number): string {
    let digits = this.length(value);

    let str = '';
    for (let i = 0; i < length - digits; i++) {
      str += '0';
    }

    return str + value.toString();
  }

  private length(value: number): number {
    return Math.floor(Math.log10(value)) + 1;
  }
}

export class BooleanMapper extends Mapper implements IMapper<boolean> {
  map(value: boolean): number {
    return value ? 1 : 0;
  }

  reverse(value: number): boolean {
    return value > 0;
  }
}
