import { matchAll, zBase32Encode, AsyncIteratorIterable } from '@tstdl/base/utils';
import { NonObjectBufferMode } from '@tstdl/server/utils';
import { TypedReadable } from '@tstdl/server/utils/typed-readable';
import { StringDecoder } from 'string_decoder';
import { createSubtitle, createVideo, Entry } from '../../common/models';
import { FilmlistMetadata } from '../../models';

const METADATA_REGEX = /{"Filmliste":\[".*?","(\d+).(\d+).(\d+),\s(\d+):(\d+)".*?"([0-9a-z]+)"\]/;
const ENTRY_REGEX = /"X":(\["(?:.|[\r\n])*?"\])(?:,|})/g;

export type FilmlistParseResult = FilmlistMetadataParseResult | EntriesParseResult;

export type FilmlistMetadataParseResult = {
  filmlist: Filmlist,
  entries: undefined
};

export type EntriesParseResult = {
  filmlist: undefined,
  entries: Entry[]
};

export class Filmlist implements AsyncIterable<Entry> {
  private readonly stream: TypedReadable<NonObjectBufferMode>;

  private parseIterable: AsyncIteratorIterable<FilmlistParseResult>;
  private buffer: string;
  private filmlistMetadata: FilmlistMetadata | undefined;
  private lastChannel: string;
  private lastTopic: string;

  constructor(stream: TypedReadable<NonObjectBufferMode>) {
    this.stream = stream;

    this.buffer = '';
    this.filmlistMetadata = undefined;
    this.lastChannel = '';
    this.lastTopic = '';
  }

  async getMetadata(): Promise<FilmlistMetadata> {
    if (this.filmlistMetadata != undefined) {
      return this.filmlistMetadata;
    }

    const iterator = this.parseFilmlist(this.stream);
    this.parseIterable = new AsyncIteratorIterable(iterator, true);
  }

  [Symbol.asyncIterator](): AsyncIterator<Entry> {

  }

  private parse(): Promise<void> {

  }

  private async *parseFilmlist(stream: TypedReadable<NonObjectBufferMode>): AsyncIterableIterator<FilmlistParseResult> {
    const stringDecoder = new StringDecoder('utf-8');

    for await (const chunk of stream) {
      this.buffer += stringDecoder.write(chunk);
    }

    this.buffer += stringDecoder.end();
  }

  parseEntries(filmlistMetadata: FilmlistMetadata): Entry[] | undefined {
    const entries: Entry[] = [];

    const regex = new RegExp(ENTRY_REGEX);
    const matches = matchAll(regex, this.buffer);

    if (matches.length == 0) {
      return undefined;
    }

    for (const match of matches) {
      const filmlistEntry = match[1];
      const entry = this.filmlistEntryToEntry(filmlistEntry, filmlistMetadata);

      entries.push(entry);
    }

    const lastMatch = matches[matches.length - 1];
    this.buffer = this.buffer.slice(lastMatch.index + lastMatch[0].length);

    return entries;
  }

  filmlistEntryToEntry(filmlistEntry: string, filmlistMetadata: FilmlistMetadata): Entry {
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
      this.lastChannel = channel;
    }

    if (topic.length > 0) {
      this.lastTopic = topic;
    }

    const [
      hoursString,
      minutesString,
      secondsString
    ] = rawDuration.split(':');
    const duration = (parseInt(hoursString) * 3600) + (parseInt(minutesString) * 60) + parseInt(secondsString);
    const timestamp = parseInt(date_l) * 1000;

    const entry: Entry = {
      id: '',
      channel: this.lastChannel,
      topic: this.lastTopic,
      title,
      timestamp,
      duration,
      description,
      website: url_website,
      firstSeen: filmlistMetadata.timestamp,
      lastSeen: filmlistMetadata.timestamp,
      media: [],
      source: {
        name: 'filmlist',
        data: {
          filmlistId: filmlistMetadata.id
        }
      }
    };

    if (url_small.length > 0) {
      const videoUrl = createUrlFromBase(url, url_small);
      const video = createVideo(videoUrl);
      entry.media.push(video);
    }

    if (url.length > 0) {
      const video = createVideo(url);
      entry.media.push(video);
    }

    if (url_hd.length > 0) {
      const videoUrl = createUrlFromBase(url, url_hd);
      const video = createVideo(videoUrl);
      entry.media.push(video);
    }

    if (url_subtitle.length > 0) {
      const subtitle = createSubtitle(url_subtitle);
      entry.media.push(subtitle);
    }

    const hashString = [entry.channel, entry.topic, entry.title, entry.timestamp, entry.duration, entry.website].join(' _ ');
    const idBuffer = createHash()   Crypto.createHash('sha1').update(hashString).digest();
    entry.id = zBase32Encode(idBuffer.buffer);

    return entry;
  }
}

function createUrlFromBase(baseUrl: string, newUrl: string): string {
  const split = newUrl.split('|');
  return baseUrl.substr(0, parseInt(split[0])) + split[1];
}
