import { AsyncIteratorIterableIterator, matchAll, zBase32Encode } from '@tstdl/base/utils';
import { createHash, NonObjectBufferMode } from '@tstdl/server/utils';
import { TypedReadable } from '@tstdl/server/utils/typed-readable';
import { StringDecoder } from 'string_decoder';
import { createSubtitle, createVideo, Entry } from '../../common/models';
import { FilmlistMetadata } from '../../models';

const METADATA_REGEX = /{"Filmliste":\["[^"]*?","(\d+).(\d+).(\d+),\s(\d+):(\d+)".*?"([0-9a-z]+)"\]/;
const ENTRY_REGEX = /"X":(\[".*?",".*?",".*?",".*?",".*?",".*?",".*?",".*?",".*?",".*?",".*?",".*?",".*?",".*?",".*?",".*?","(?:\d+|)",".*?",".*?","(?:false|true)"\])(?:,|})/g;

export type FilmlistParseResult = FilmlistMetadataParseResult | EntriesParseResult;

export type FilmlistMetadataParseResult = {
  filmlistMetadata: FilmlistMetadata,
  entries: undefined
};

export type EntriesParseResult = {
  filmlistMetadata: undefined,
  entries: Entry[]
};

export class Filmlist implements AsyncIterable<Entry[]> {
  private readonly stream: TypedReadable<NonObjectBufferMode>;

  private parseIterable: AsyncIteratorIterableIterator<FilmlistParseResult> | undefined;
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

    const iterable = this.getIterable();

    for await (const item of iterable) {
      if (item.filmlistMetadata != undefined) {
        this.filmlistMetadata = item.filmlistMetadata;
        return this.filmlistMetadata;
      }

      if (item.entries != undefined) {
        throw new Error('this should not happen...');
      }
    }

    throw new Error('could not parse filmlist');
  }

  async *[Symbol.asyncIterator](): AsyncIterator<Entry[]> {
    const iterable = this.getIterable();
    await this.getMetadata();

    for await (const item of iterable) {
      if (item.entries != undefined) {
        yield item.entries;
      }
      else if (item.filmlistMetadata != undefined) {
        throw new Error('this should not happen...');
      }
    }
  }

  private getIterable(): AsyncIteratorIterableIterator<FilmlistParseResult> {
    if (this.parseIterable == undefined) {
      const iterator = this.parseFilmlist();
      this.parseIterable = new AsyncIteratorIterableIterator(iterator, true);
    }

    return this.parseIterable;
  }

  private async *parseFilmlist(): AsyncIterableIterator<FilmlistParseResult> {
    const stringDecoder = new StringDecoder('utf8');

    for await (const chunk of this.stream) {
      this.buffer += stringDecoder.write(chunk);

      if (this.buffer.length < 50000) {
        continue;
      }

      const result = this.parse();

      if (result != undefined) {
        yield result;
      }
    }

    this.buffer += stringDecoder.end();
    const result = this.parse();

    if (result != undefined) {
      yield result;
    }
  }

  private parse(): FilmlistParseResult | undefined {
    if (this.filmlistMetadata == undefined) {
      const filmlistMetadata = this.parseFilmlistMetadata();

      if (filmlistMetadata != undefined) {
        return { filmlistMetadata, entries: undefined };
      }
    }
    else {
      const entries = this.parseEntries(this.filmlistMetadata);

      if (entries != undefined) {
        return { filmlistMetadata: undefined, entries };
      }
    }

    return undefined;
  }

  private parseFilmlistMetadata(): FilmlistMetadata | undefined {
    const match = this.buffer.match(METADATA_REGEX);

    if (match == undefined) {
      return undefined;
    }

    this.buffer = this.buffer.slice((match.index as number) + match[0].length);

    const [, day, month, year, hour, minute, id] = match;
    const date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute)));
    const timestamp = date.getTime();

    const filmlist: FilmlistMetadata = {
      id,
      timestamp
    };

    return filmlist;
  }

  parseEntries(filmlistMetadata: FilmlistMetadata): Entry[] | undefined {
    const regex = new RegExp(ENTRY_REGEX);
    const matches = matchAll(regex, this.buffer);

    if (matches.length == 0) {
      return undefined;
    }

    const entries = matches.map((match) => this.filmlistEntryToEntry(match[1], filmlistMetadata));

    const lastMatch = matches[matches.length - 1];
    this.buffer = this.buffer.slice((lastMatch.index) + lastMatch[0].length);

    return entries;
  }

  filmlistEntryToEntry(filmlistEntry: string, filmlistMetadata: FilmlistMetadata): Entry {
    const parsedFilmlistEntry = JSON.parse(filmlistEntry) as string[];

    const [
      // tslint:disable: variable-name
      channel,
      topic,
      title,
      , // date,
      , // time,
      rawDuration,
      , // size,
      description,
      url,
      url_website,
      url_subtitle,
      , // url_rtmp,
      url_small,
      , // url_rtmp_small,
      url_hd,
      , // url_rtmp_hd,
      date_l,
      // url_history,
      // geo,
      // is_new
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

    const hashString = [entry.channel, entry.topic, entry.title, entry.timestamp, entry.duration, entry.website].join('-');
    const idBuffer = createHash('sha1', hashString).toBuffer();
    entry.id = zBase32Encode(idBuffer.buffer);

    return entry;
  }
}

function createUrlFromBase(baseUrl: string, newUrl: string): string {
  const split = newUrl.split('|');
  return baseUrl.substr(0, parseInt(split[0])) + split[1];
}
