import { Readable } from 'stream';
import { StreamIterable } from './stream-iterable';

export async function readStream(readable: Readable, maxBytes?: number): Promise<Buffer> {
  const streamIterable = new StreamIterable<Buffer>(readable);

  let totalLength: number = 0;
  const chunks: Buffer[] = [];

  for await (const chunk of streamIterable) { // tslint:disable-line: await-promise
    chunks.push(chunk);
    totalLength += chunk.length;

    if (maxBytes != undefined && totalLength >= maxBytes) {
      readable.destroy(new Error(`maximum size of ${maxBytes} bytes exceeded`));
    }
  }

  const buffer = Buffer.concat(chunks, totalLength);
  return buffer;
}
