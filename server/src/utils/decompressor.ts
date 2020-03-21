import * as LZMA from 'lzma-native';
import { Readable } from 'stream';

export function decompress(stream: Readable): Readable {
  const decompressor = LZMA.createDecompressor();
  const decompressedStream = stream.pipe(decompressor);

  const originalDestroy = decompressedStream.destroy.bind(decompressedStream);

  // eslint-disable-next-line @typescript-eslint/unbound-method
  decompressedStream.destroy = () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    (decompressedStream as any).cleanup();
    originalDestroy();
  };

  return decompressedStream;
}
