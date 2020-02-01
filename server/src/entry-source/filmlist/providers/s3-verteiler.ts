import { NonObjectBufferMode } from '@tstdl/server/utils';
import { TypedReadable } from '@tstdl/server/utils/typed-readable';
import * as Minio from 'minio';
import { createGunzip } from 'zlib';
import { Filmlist } from '../filmlist';
import { FilmlistProvider, FilmlistResource } from '../provider';

type S3Filmlist = Filmlist<S3FilmlistResource>;
type S3FilmlistResource = FilmlistResource<typeof providerName, { bucket: string, object: string, etag: string }>;

const providerName = 's3';

type Options = {
  url: string,
  accessKey: string,
  secretKey: string,
  latest?: LatestOptions,
  archive?: ArchiveOptions
};

type LatestOptions = {
  bucket: string,
  object: string
};

type ArchiveOptions = {
  bucket: string,
  prefix?: string
};

export class S3FilmlistVerteilerFilmlistProvider implements FilmlistProvider<S3FilmlistResource> {
  private readonly s3: Minio.Client;
  private readonly latest: LatestOptions | undefined;
  private readonly archive: ArchiveOptions | undefined;

  readonly name: string = 's3';

  constructor({ url, accessKey, secretKey, latest, archive }: Options) {
    const { hostname, port, protocol } = new URL(url);

    this.s3 = new Minio.Client({
      endPoint: hostname,
      port: port.length > 0 ? parseInt(port) : undefined,
      useSSL: protocol == 'https:',
      accessKey,
      secretKey
    });

    this.latest = latest;
    this.archive = archive;
  }

  async getLatest(): Promise<S3Filmlist> {
    if (this.latest == undefined) {
      throw new Error('s3 options for latest not provided');
    }

    return this.getFilmlist(this.latest.bucket, this.latest.object);
  }

  async *getArchive(): AsyncIterable<S3Filmlist> {
    if (this.archive == undefined) {
      throw new Error('s3 options for archive not provided');
    }

    const stream = this.s3.listObjectsV2(this.archive.bucket, this.archive.prefix, true) as TypedReadable<Minio.BucketItem>;

    for await (const item of stream) {
      if (1 == 1) throw new Error('verify that prefix is not needed');
      yield this.getFilmlist(this.archive.bucket, item.name, item.etag);
    }

    throw new Error('archive not supported');
  }

  async getFromResource(resource: S3FilmlistResource): Promise<S3Filmlist> {
    const metadata = await this.s3.statObject(resource.data.bucket, resource.data.object);

    if (metadata.etag != resource.data.etag) {
      throw new Error('etag mismatch');
    }

    return this.getFilmlist(resource.data.bucket, resource.data.object, resource.data.etag);
  }

  private async getFilmlist(bucket: string, object: string, etag?: string): Promise<S3Filmlist> {
    const _etag = etag ?? (await this.s3.statObject(bucket, object)).etag;
    const resource: S3FilmlistResource = { providerName, data: { bucket, object, etag: _etag } };
    const streamProvider = this.getStreamProvider(bucket, object);
    const filmlist = new Filmlist(resource, streamProvider);

    return filmlist;
  }

  private getStreamProvider(bucket: string, object: string): () => Promise<TypedReadable<NonObjectBufferMode>> {
    const streamProvider = async () => {
      const s3Stream = await this.s3.getObject(bucket, object);
      const gunzipStream = createGunzip();
      const filmlistStream = s3Stream.on('error', (error) => gunzipStream.destroy(error as Error)).pipe(gunzipStream) as TypedReadable<NonObjectBufferMode>;

      return filmlistStream;
    };

    return streamProvider;
  }
}
