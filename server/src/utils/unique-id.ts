import * as OS from 'os';
import * as Crypto from 'crypto';

import { base62Encode, base62Decode } from '../utils';

const instance = Crypto.randomBytes(4);
const pidBuffer = numberToBuffer(process.pid);

let counter = 0;
let lastTimestamp: number;

export function uniqueID(): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const timestampBuffer = numberToBuffer(timestamp);

  if (timestamp != lastTimestamp) {
    counter = 0;
    lastTimestamp = timestamp;
  }

  const counterBuffer = numberToBuffer(++counter);

  const buffer = Buffer.concat([counterBuffer, timestampBuffer, instance, pidBuffer]);
  const id = base62Encode(buffer);

  return id;
}

function numberToBuffer(value: number): Buffer {
  const bytes = Math.ceil(Math.log2(value + 1) / 8);

  const buffer = Buffer.allocUnsafe(bytes);
  buffer.writeUIntLE(value, 0, bytes);

  return buffer;
}
