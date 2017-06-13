export interface IRedisSerializer<T, T2> {
  serialize(value: T): T2;
  deserialize(value: T2): T;
}

export abstract class RedisSerializerBase { }

export class IntSerializer implements IRedisSerializer<number, string> {
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

export class BooleanSerializer implements IRedisSerializer<boolean, string> {
  serialize(value: boolean): string {
    return value ? '1' : '0';
  }

  deserialize(value: string): boolean {
    return value === '1';
  }
}
