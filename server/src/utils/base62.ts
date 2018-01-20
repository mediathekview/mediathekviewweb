import * as BASEX from 'base-x';

const BASE62 = BASEX('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');

export const base62Encode: (buffer: Buffer) => string = BASE62.encode;
export const base62Decode: (string: string) => Buffer = BASE62.decode;