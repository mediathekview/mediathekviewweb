import * as LZMA from 'lzma-native';
import { Readable } from 'stream';

export function decompress(stream: Readable): Readable {
  const decompressor = LZMA.createDecompressor();
  const decompressedStream = stream.pipe(decompressor);

  const originalDestroy = decompressedStream.destroy.bind(decompressedStream);

  decompressedStream.destroy = () => {
    (decompressedStream as any).cleanup();
    originalDestroy();
  };

  return decompressedStream;
}
