import type { Logger } from '@tstdl/base/logger';
import type { StringMap } from '@tstdl/base/types';
import { isDefined } from '@tstdl/base/utils';
import { createHash } from '@tstdl/server/utils';
import type { TypedReadable } from '@tstdl/server/utils/typed-readable';
import * as Minio from 'minio';
import type { Readable } from 'stream';
import { pipeline } from 'stream';
import * as xz from 'xz';
import { createGunzip } from 'zlib';
import type { FilmlistResource } from '../filmlist-resource';
import type { FilmlistProvider } from '../provider';

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
  LastModified = 0,
  FileName = 1
}

const FILENAME_DATE_PATTERN = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/u;

export class S3FilmlistProvider implements FilmlistProvider<S3FilmlistResource> {
  private readonly s3: Minio.Client;
  private readonly latest: LatestOptions | undefined;
  private readonly archive: ArchiveOptions | undefined;
  private readonly logger: Logger;

  readonly type: 's3' = 's3';
  readonly source: string;

  constructor(instanceName: string, { url, accessKey, secretKey, latest, archive }: S3FilmlistProviderOptions, logger: Logger) {
    this.source = instanceName;
    this.logger = logger;

    const { hostname, port, protocol } = new URL(url);

    this.s3 = new Minio.Client({
      endPoint: hostname,
      port: port.length > 0 ? parseInt(port, 10) : undefined,
      useSSL: protocol == 'https:',
      accessKey,
      secretKey
    });

    this.latest = latest;
    this.archive = archive;
  }

  canHandle(resource: FilmlistResource): boolean {
    return resource.type == this.type && resource.source == this.source;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async *getLatest(): AsyncIterable<S3FilmlistResource> {
    if (this.latest == undefined) {
      return;
    }

    yield this.getFilmlistResource(this.latest.bucket, this.latest.object, FilmlistResourceTimestampStrategy.LastModified);
  }

  async *getArchive(): AsyncIterable<S3FilmlistResource> {
    if (this.archive == undefined) {
      return;
    }

    const stream = this.s3.listObjectsV2(this.archive.bucket, this.archive.prefix, true) as TypedReadable<Minio.BucketItem>;

    for await (const { name, etag, lastModified, size } of stream) {
      yield this.getFilmlistResource(this.archive.bucket, name, this.archive.timestampStrategy, { etag, lastModified, size });
    }
  }

  async getFromResource(resource: S3FilmlistResource): Promise<Readable> {
    const metadata = await this.s3.statObject(resource.data.bucket, resource.data.object);

    if (metadata.etag != resource.data.etag) {
      throw new Error('etag mismatch');
    }

    return this.getStream(resource.data.bucket, resource.data.object);
  }

  private async getFilmlistResource(bucket: string, object: string, resourceTimestampStrategy: FilmlistResourceTimestampStrategy, data?: { etag: string, lastModified: number | Date, size: number, resourceTimestamp?: number }): Promise<S3FilmlistResource> {
    const { etag, lastModified: lastModifiedData, size } = data != undefined ? data : await this.s3.statObject(bucket, object);
    const lastModified = typeof lastModifiedData == 'number' ? lastModifiedData : lastModifiedData.valueOf();

    const resourceData: S3FilmlistResourceData = { bucket, object, etag, lastModified, size };
    const tag = createHash('sha1', `${etag} ${lastModified} ${size}`).toZBase32();

    let timestamp: number;

    switch (resourceTimestampStrategy) {
      case FilmlistResourceTimestampStrategy.LastModified:
        timestamp = lastModified;
        break;

      case FilmlistResourceTimestampStrategy.FileName:
        timestamp = parseFilenameTimestamp(object);
        break;

      default:
        throw new Error('invalid ArchiveFilmlistResourceTimestampStrategy');
    }

    const resource: S3FilmlistResource = { type: 's3', source: this.source, tag, timestamp, data: resourceData };
    return resource;
  }

  private async getStream(bucket: string, object: string): Promise<Readable> {
    let stream = await this.s3.getObject(bucket, object) as NodeJS.ReadableStream;

    const decompressStream
      = object.endsWith('.gz') ? createGunzip()
        : object.endsWith('.xz') ? new xz.Decompressor()
          : undefined;

    if (decompressStream != undefined) {
      stream = pipeline(stream, decompressStream, (error) => {
        if (isDefined(error)) {
          this.logger.error(error, true);
        }
      });
    }

    return stream as Readable;
  }
}

function parseFilenameTimestamp(object: string): number {
  const match = FILENAME_DATE_PATTERN.exec(object);

  if (match == undefined) {
    throw new Error('could not parse timestamp from filename');
  }

  const { year, month, day } = match.groups as StringMap<string>;
  return Date.UTC(parseInt(year!, 10), parseInt(month!, 10) - 1, parseInt(day!, 10));
}
