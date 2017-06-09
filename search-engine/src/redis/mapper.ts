export interface IMapper<T> {
  map(value: T): string;
  reverse(value: string): T;
}

export class StringMapper implements IMapper<string> {
  map(value: string): string {
    return value;
  }

  reverse(value: string): string {
    return value;
  }
}

export class IntMapper implements IMapper<number> {
  maxDigits: number;

  constructor(maxDigits: number) {
    this.maxDigits = maxDigits;
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

export class BooleanMapper implements IMapper<boolean> {
  map(value: boolean): string {
    return value ? '1' : '0';
  }

  reverse(value: string): boolean {
    return value === '1';
  }
}

export class UniversalMapper implements IMapper<any> {
  private static warned: boolean = false;

  constructor() {
    if (!UniversalMapper.warned) {
      console.warn('UniversalMapper is slower and consumes more memory. Consider using a specific Mapper instead');
      UniversalMapper.warned = true;
    }
  }

  map(value: any): string {
    return JSON.stringify(value);
  }

  reverse(value: string): any {
    return JSON.parse(value);
  }
}
