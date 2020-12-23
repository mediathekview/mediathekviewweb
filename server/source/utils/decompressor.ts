import * as LZMA from 'lzma-native';
import type { Readable } from 'stream';
import { pipeline } from 'stream';

export function decompress(stream: Readable): Readable {
  const decompressor = LZMA.createDecompressor();
  const decompressedStream = pipeline(stream, decompressor);

  const originalDestroy = decompressedStream.destroy.bind(decompressedStream);

  decompressedStream.destroy = () => {
    decompressedStream.cleanUp();
    originalDestroy();
  };

  return decompressedStream;
}
