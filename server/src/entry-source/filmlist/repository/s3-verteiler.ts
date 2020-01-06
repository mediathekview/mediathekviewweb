import { NonObjectBufferMode } from '@tstdl/server/utils';
import { TypedReadable } from '@tstdl/server/utils/typed-readable';
import * as Minio from 'minio';
import { Duplex, Stream } from 'stream';
import { createGunzip } from 'zlib';
import { FilmlistRepository } from './repository';
import { Filmlist } from '../filmlist';

export function toReadable(stream: Stream): TypedReadable<NonObjectBufferMode> {
  const duplex = new Duplex();
  stream.pipe(duplex);

  return duplex;
}

export class S3FilmlistVerteilerFilmlistRepository implements FilmlistRepository {
  private readonly s3: Minio.Client;
  private readonly bucket: string;
  private readonly object: string;

  constructor(url: URL, accessKey: string, secretKey: string, bucket: string, object: string) {
    this.s3 = new Minio.Client({
      endPoint: url.hostname,
      port: url.port.length > 0 ? parseInt(url.port) : undefined,
      useSSL: url.protocol == 'https:',
      accessKey,
      secretKey
    });
  }

  async getLatest(): Promise<Filmlist> {
    const s3Stream = await this.s3.getObject(this.bucket, this.object);
    const gunzipStream = createGunzip();
    const filmlistStream = s3Stream.on('error', (error) => gunzipStream.destroy(error)).pipe(gunzipStream) as TypedReadable<NonObjectBufferMode>;

  }

  async *getArchive(): AsyncIterable<Filmlist> {
  }
}
