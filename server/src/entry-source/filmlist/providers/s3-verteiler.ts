import { NonObjectBufferMode } from '@tstdl/server/utils';
import { TypedReadable } from '@tstdl/server/utils/typed-readable';
import * as Minio from 'minio';
import { createGunzip } from 'zlib';
import { Filmlist } from '../filmlist';
import { FilmlistProvider } from '../provider';

export class S3FilmlistVerteilerFilmlistProvider implements FilmlistProvider {
  private readonly s3: Minio.Client;
  private readonly bucket: string;
  private readonly object: string;

  readonly type: string = 's3';

  constructor(url: string, accessKey: string, secretKey: string, bucket: string, object: string) {
    const { hostname, port, protocol } = new URL(url);

    this.s3 = new Minio.Client({
      endPoint: hostname,
      port: port.length > 0 ? parseInt(port) : undefined,
      useSSL: protocol == 'https:',
      accessKey,
      secretKey
    });

    this.bucket = bucket;
    this.object = object;
  }

  async getLatest(): Promise<Filmlist> {
    const s3Stream = await this.s3.getObject(this.bucket, this.object);
    const gunzipStream = createGunzip();
    const filmlistStream = s3Stream.on('error', (error) => gunzipStream.destroy(error as Error)).pipe(gunzipStream) as TypedReadable<NonObjectBufferMode>;
    const filmlist = new Filmlist(filmlistStream);

    return filmlist;
  }

  getArchive(): AsyncIterable<Filmlist> {
    throw new Error('archive not supported');
  }
}
