import { randomBytes } from 'crypto';
import { zBase32Encode } from '../common/utils';

export function uniqueId(): string {
  const bytes = randomBytes(16);
  const id = zBase32Encode(bytes);

  return id;
}

function numberToBuffer(value: number): Buffer {
  const bytes = Math.ceil(Math.log2(value + 1) / 8);

  const buffer = Buffer.allocUnsafe(bytes);
  buffer.writeUIntLE(value, 0, bytes);

  return buffer;
}
