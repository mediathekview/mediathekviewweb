import { StringMap } from '@tstdl/base/types';
import { createHash, NonObjectBufferMode } from '@tstdl/server/utils';
import { TypedReadable } from '@tstdl/server/utils/typed-readable';
import * as Minio from 'minio';
import * as xz from 'xz';
import { createGunzip } from 'zlib';
import { Filmlist } from '../filmlist';
import { FilmlistResource } from '../filmlist-resource';
import { FilmlistProvider } from '../provider';

type S3Filmlist = Filmlist<S3FilmlistResource>;

type S3FilmlistResource = FilmlistResource<'s3', S3FilmlistResourceData>;

type S3FilmlistResourceData = {
  bucket: string,
  object: string,
  etag: string,
  lastModified: number,
  size: number
};

export type S3FilmlistProviderOptions = {
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
  prefix?: string,
  timestampStrategy: FilmlistResourceTimestampStrategy
};

export enum FilmlistResourceTimestampStrategy {
  None,
  LastModified,
  FileName
}

const FILENAME_DATE_PATTERN = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/;

export class S3FilmlistProvider implements FilmlistProvider<S3FilmlistResource> {
  private readonly s3: Minio.Client;
  private readonly latest: LatestOptions | undefined;
  private readonly archive: ArchiveOptions | undefined;

  readonly name: string;

  constructor(instanceName: string, { url, accessKey, secretKey, latest, archive }: S3FilmlistProviderOptions) {
    this.name = `s3:${instanceName}`;

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

  async *getLatest(): AsyncIterable<S3Filmlist> {
    if (this.latest == undefined) {
      throw new Error('s3 options for latest not provided');
    }

    yield this.getFilmlist(this.latest.bucket, this.latest.object, FilmlistResourceTimestampStrategy.LastModified);
  }

  async *getArchive(): AsyncIterable<S3Filmlist> {
    if (this.archive == undefined) {
      throw new Error('s3 options for archive not provided');
    }

    const stream = this.s3.listObjectsV2(this.archive.bucket, this.archive.prefix, true) as TypedReadable<Minio.BucketItem>;

    for await (const { name, etag, lastModified, size } of stream) {
      yield this.getFilmlist(this.archive.bucket, name, this.archive.timestampStrategy, { etag, lastModified, size });
    }
  }

  async getFromResource(resource: S3FilmlistResource): Promise<S3Filmlist> {
    const metadata = await this.s3.statObject(resource.data.bucket, resource.data.object);

    if (metadata.etag != resource.data.etag) {
      throw new Error('etag mismatch');
    }

    return this.getFilmlist(resource.data.bucket, resource.data.object, FilmlistResourceTimestampStrategy.None, { ...resource.data, resourceTimestamp: resource.timestamp });
  }

  private async getFilmlist(bucket: string, object: string, resourceTimestampStrategy: FilmlistResourceTimestampStrategy, data?: { etag: string, lastModified: number | Date, size: number, resourceTimestamp?: number }): Promise<S3Filmlist> {
    const { etag, lastModified: lastModifiedData, size } = data != undefined ? data : await this.s3.statObject(bucket, object);
    const lastModified = typeof lastModifiedData == 'number' ? lastModifiedData : lastModifiedData.valueOf();

    const resourceData: S3FilmlistResourceData = { bucket, object, etag, lastModified, size };
    const id = createHash('sha1', `${object} ${etag} ${lastModified} ${size}`).toZBase32();

    let timestamp: number;

    switch (resourceTimestampStrategy) {
      case FilmlistResourceTimestampStrategy.None:
        if (data?.resourceTimestamp == undefined) {
          throw new Error('FilmlistResourceTimestampStrategy is None, but resourceTimestamp not provided');
        }

        timestamp = data.resourceTimestamp;
        break;

      case FilmlistResourceTimestampStrategy.LastModified:
        timestamp = lastModified;
        break;

      case FilmlistResourceTimestampStrategy.FileName:
        timestamp = this.parseFilenameTimestamp(object);
        break;

      default:
        throw new Error('invalid ArchiveFilmlistResourceTimestampStrategy');
    }

    const resource: S3FilmlistResource = { id, providerName: this.name as 's3', timestamp, data: resourceData };
    const streamProvider = this.getStreamProvider(bucket, object);
    const filmlist = new Filmlist(resource, streamProvider);

    return filmlist;
  }

  private parseFilenameTimestamp(object: string): number {
    const match = object.match(FILENAME_DATE_PATTERN);

    if (match == undefined) {
      throw new Error('could not parse timestamp from filename');
    }

    const { year, month, day } = match.groups as StringMap<string>;
    return Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day));
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
