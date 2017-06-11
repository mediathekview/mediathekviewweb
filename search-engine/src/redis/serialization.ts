export interface ISerializer<T> {
  serialize(value: T): string;
  deserialize(value: string): T;
}

export class StringSerializer implements ISerializer<string> {
  serialize(value: string): string {
    return value;
  }

  deserialize(value: string): string {
    return value;
  }
}

export class IntSerializer implements ISerializer<number> {
  maxDigits: number;

  constructor(maxDigits: number) {
    this.maxDigits = maxDigits;
  }

  serialize(value: number): string {
    return this.leftPad(value, this.maxDigits);
  }

  deserialize(value: string): number {
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

export class BooleanSerializer implements ISerializer<boolean> {
  serialize(value: boolean): string {
    return value ? '1' : '0';
  }

  deserialize(value: string): boolean {
    return value === '1';
  }
}

export class UniversalSerializer implements ISerializer<any> {
  private static warned: boolean = false;

  constructor() {
    if (!UniversalSerializer.warned) {
      console.warn('UniversalSerializer is slower and consumes more memory. Consider using a specific Serializer instead');
      UniversalSerializer.warned = true;
    }
  }

  serialize(value: any): string {
    return JSON.stringify(value);
  }

  deserialize(value: string): any {
    return JSON.parse(value);
  }
}
