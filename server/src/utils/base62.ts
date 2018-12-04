import * as BASEX from 'base-x';

const BASE62 = BASEX('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');

export const base62Encode: (buffer: Buffer) => string = BASE62.encode;
export const base62Decode: (string: string) => Buffer = BASE62.decode;


const alphabet = 'ybndrfg8ejkmcpqxot1uwisza345h769';
const valueCharMap = new Map(alphabet.split('').map((char, index) => [index, char] as [number, string]));
const charValueMap = new Map(alphabet.split('').map((char, index) => [char, index] as [string, number]));

function zBase32Encode(bytes: Uint8Array): string {
  let result: string = '';

  for (let bit = 0; bit < bytes.length * 8; bit += 5) {
    const index = Math.floor(bit / 8);
    const byte = bytes[index];
    const offset = bit % 8;

    let value: number;

    if (offset <= 3) {
      value = byte >> (3 - offset) & 0b00011111;
    }
    else {
      value = byte & (0b00011111 >> (offset - 3)) << (offset - 3);

      if (index < bytes.length - 1) {
        const nextByte = bytes[index + 1];
        value |= nextByte >> (8 - (offset - 3));
      }
    }

    const char = valueCharMap.get(value) as string;
    result += char;
  }

  return result;
}

function zBase32Decode(encodedString: string): Uint8Array {
  const neededBytes = Math.ceil(encodedString.length * 5 / 8);
  const bytes = new Uint8Array(neededBytes);

  for (let i = 0; i < encodedString.length; i++) {
    const char = encodedString[i];
    const value = charValueMap.get(char) as number;
    const bitIndex = i * 5;
    const byteIndex = Math.floor(bitIndex / 8);
    const bytesCount = Math.floor(bitIndex / 8);
    const offset = bitIndex % 8;

    if (offset <= 3) {
      bytes[byteIndex] |= value << (3 - offset);
    } else {
      bytes[byteIndex] |= value >> (offset - 3);

      if (byteIndex < bytesCount - 1) {
        bytes[byteIndex + 1] |= value << (8 - (offset - 3));
      }
    }
  }

  return bytes;
}




    switch (offset) {
      case 0:
        byte = value << 3;
        break;

      case 1:
        byte |= value << 2;
        break;

      case 2:
        byte |= value << 1;
        break;

      case 3:
        byte |= value;
        break;

      case 4:
        byte |= value >> 1;
        nextByte |= value << 7;
        break;

      case 5:
        byte |= value >> 2;
        nextByte |= value << 6;
        break;

      case 6:
        byte |= value >> 3;
        nextByte |= value << 5;
        break;

      case 7:
        byte |= value >> 4;
        nextByte |= value << 4;
        break;
    }
