import { createHash, NonObjectBufferMode } from '@tstdl/server/utils';
import { TypedReadable } from '@tstdl/server/utils/typed-readable';
import * as Minio from 'minio';
import * as xz from 'xz';
import { createGunzip } from 'zlib';
import { Filmlist } from '../filmlist';
import { FilmlistProvider, FilmlistResource } from '../provider';

type S3Filmlist = Filmlist<S3FilmlistResource>;
type S3FilmlistResource = FilmlistResource<typeof providerName, S3FilmlistResourceData>;
type S3FilmlistResourceData = {
  bucket: string,
  object: string,
  etag: string,
  lastModified: number,
  size: number
};

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

    for await (const { name, etag, lastModified, size } of stream) {
      yield this.getFilmlist(this.archive.bucket, name, { etag, lastModified, size });
    }
  }

  async getFromResource(resource: S3FilmlistResource): Promise<S3Filmlist> {
    const metadata = await this.s3.statObject(resource.data.bucket, resource.data.object);

    if (metadata.etag != resource.data.etag) {
      throw new Error('etag mismatch');
    }

    return this.getFilmlist(resource.data.bucket, resource.data.object, resource.data);
  }

  private async getFilmlist(bucket: string, object: string, data?: { etag: string, lastModified: number | Date, size: number }): Promise<S3Filmlist> {
    const { etag, lastModified: lastModifiedData, size } = data != undefined ? data : await this.s3.statObject(bucket, object);
    const lastModified = typeof lastModifiedData == 'number' ? lastModifiedData : lastModifiedData.valueOf();

    const resourceData: S3FilmlistResourceData = { bucket, object, etag, lastModified, size };
    const id = createHash('sha1', `${object} ${etag} ${lastModified} ${size}`).toZBase32();

    const resource: S3FilmlistResource = { id, providerName, data: resourceData };
    const streamProvider = this.getStreamProvider(bucket, object);
    const filmlist = new Filmlist(resource, streamProvider);

    return filmlist;
  }

  private getStreamProvider(bucket: string, object: string): () => Promise<TypedReadable<NonObjectBufferMode>> {
    const streamProvider = async () => {
      let stream = await this.s3.getObject(bucket, object);

      const decompressStream =
        object.endsWith('.gz') ? createGunzip()
          : object.endsWith('.xz') ? new xz.Decompressor()
            : undefined;

      if (decompressStream != undefined) {
        stream = stream.on('error', (error) => decompressStream.destroy(error as Error)).pipe(decompressStream);
      }

      return stream as TypedReadable<NonObjectBufferMode>;
    };

    return streamProvider;
  }
}
