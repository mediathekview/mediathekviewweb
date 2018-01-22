import * as LZMA from 'lzma-native';
import { Readable, Duplex } from 'stream';

export function decompress(stream: Readable): Readable {
    const decompressor = LZMA.createDecompressor() as Duplex;

    const decompressedStream = stream.pipe(decompressor);
    return decompressedStream;
}
