import * as Crypto from 'crypto';
import { Readable } from 'stream';
import { Entry, FilmlistMetadata, MediaFactory, Quality } from '../../common/model';
import { DeferredPromise, zBase32Encode } from '../../common/utils';
import { StreamIterable } from '../../utils';

const METADATA_REGEX = /{"Filmliste":\[".*?","(\d+).(\d+).(\d+),\s(\d+):(\d+)".*?"([0-9a-z]+)"\]/;
const ENTRY_REGEX = /"X":(\["(?:.|[\r\n])*?"\])(?:,|})/;

const READ_SIZE = 100 * 1024; // 100 KB

export class FilmlistParser implements AsyncIterable<Entry[]> {
  private readonly stream: Readable;
  private readonly streamIterable: StreamIterable<string>;

  private _metadata?: FilmlistMetadata;
  private _metadataPromise: DeferredPromise<FilmlistMetadata>;
  private currentChannel: string;
  private currentTopic: string;

  constructor(stream: Readable) {
    this.stream = stream;

    this.streamIterable = new StreamIterable<string>(this.stream, READ_SIZE);
    this.currentChannel = '';
    this.currentTopic = '';
    this._metadataPromise = new DeferredPromise();
  }

  get metadata(): Promise<FilmlistMetadata> {
    return this._metadataPromise;
  }

  async *[Symbol.asyncIterator](): AsyncIterableIterator<Entry[]> {
    let buffer = '';
    for await (const chunk of this.streamIterable) { // tslint:disable-line: await-promise
      buffer += chunk;

      if (this._metadata == undefined) {
        const metadataResult = this.parseMetadata(buffer);

        if (metadataResult != undefined) {
          this._metadata = metadataResult.metadata;
          this._metadataPromise.resolve(this._metadata);
          buffer = metadataResult.buffer;
        }
      }

      if (this._metadata != undefined) {
        const entriesResult = this.parseEntries(buffer, this._metadata);

        if (entriesResult != undefined) {
          buffer = entriesResult.buffer;
          yield entriesResult.entries;
        }
      }
    }
  }

  private parseMetadata(buffer: string): { metadata: FilmlistMetadata, buffer: string } | undefined {
    const match = buffer.match(METADATA_REGEX);

    if (match == undefined) {
      return undefined;
    }

    const subBuffer = buffer.slice((match.index as number) + match[0].length);

    const [, day, month, year, hour, minute, hash] = match;
    const date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute)));
    const timestamp = Math.floor(date.valueOf() / 1000);
    const metadata: FilmlistMetadata = { timestamp, hash };

    return { metadata, buffer: subBuffer };
  }

  private parseEntries(buffer: string, metadata: FilmlistMetadata): { entries: Entry[], buffer: string } | undefined {
    const entries: Entry[] = [];

    let match: RegExpMatchArray | null;
    while ((match = buffer.match(ENTRY_REGEX)) != undefined) {
      buffer = buffer.slice((match.index as number) + match[0].length);

      const filmlistEntry = match[1];
      const entry = this.filmlistEntryToEntry(filmlistEntry, metadata);

      entries.push(entry);
    }

    if (entries.length == 0) {
      return undefined;
    }

    return { entries, buffer };
  }

  private filmlistEntryToEntry(filmlistEntry: string, metadata: FilmlistMetadata): Entry {
    const parsedFilmlistEntry: string[] = JSON.parse(filmlistEntry) as string[];

    const [
      // tslint:disable: variable-name
      channel,
      topic,
      title,
      date,
      time,
      rawDuration,
      size,
      description,
      url,
      url_website,
      url_subtitle,
      url_rtmp,
      url_small,
      url_rtmp_small,
      url_hd,
      url_rtmp_hd,
      date_l,
      url_history,
      geo,
      is_new
      // tslint:enable: variable-name
    ] = parsedFilmlistEntry;

    if (channel.length > 0) {
      this.currentChannel = channel;
    }

    if (topic.length > 0) {
      this.currentTopic = topic;
    }

    const [hoursString, minutesString, secondsString] = rawDuration.split(':');
    const duration = (parseInt(hoursString) * 3600) + (parseInt(minutesString) * 60) + parseInt(secondsString);

    const timestamp = parseInt(date_l);

    const entry: Entry = {
      id: '',
      channel: this.currentChannel,
      topic: this.currentTopic,
      title,
      timestamp,
      duration,
      description,
      website: url_website,
      firstSeen: metadata.timestamp,
      lastSeen: metadata.timestamp,
      media: [],

      source: {
        identifier: 'filmlist',
        data: metadata
      }
    }

    if (url_small.length > 0) {
      entry.media.push(MediaFactory.createVideo(this.createUrlFromBase(url, url_small), null, Quality.Low));
    }
    if (url.length > 0) {
      entry.media.push(MediaFactory.createVideo(url, null, Quality.Medium));
    }
    if (url_hd.length > 0) {
      entry.media.push(MediaFactory.createVideo(this.createUrlFromBase(url, url_hd), null, Quality.High));
    }
    if (url_subtitle.length > 0) {
      entry.media.push(MediaFactory.createSubtitle(url_subtitle, null));
    }

    const urlsString = `${url_small}_${url}_${url_hd}`;
    const hashString = [entry.channel, entry.topic, entry.title, entry.timestamp, entry.duration, entry.website, urlsString].join(' _ ');

    const idBuffer = Crypto.createHash('sha1').update(hashString).digest();
    entry.id = zBase32Encode(idBuffer.buffer);

    return entry;
  }

  private createUrlFromBase(baseUrl: string, newUrl: string): string {
    const split = newUrl.split('|');
    return baseUrl.substr(0, parseInt(split[0])) + split[1];
  }
}
