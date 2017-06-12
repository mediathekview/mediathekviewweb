import { ISerializer } from '../serialization';

export abstract class RedisSerializerBase { }

/*export class StringSerializer extends RedisSerializerBase implements ISerializer<string, string> {
  serialize(value: string): string {
    return value;
  }

  deserialize(value: string): string {
    return value;
  }
}*/

export class IntSerializer extends RedisSerializerBase implements ISerializer<number, string> {
  maxDigits: number;

  constructor(maxDigits: number) {
    super();

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

export class BooleanSerializer extends RedisSerializerBase implements ISerializer<boolean, string> {
  serialize(value: boolean): string {
    return value ? '1' : '0';
  }

  deserialize(value: string): boolean {
    return value === '1';
  }
}
