import { createSubtitle, createVideo } from '$shared/models/core';
import type { FilmlistEntry } from '$shared/models/filmlist';
import { AsyncIteratorIterableIterator, isDefined, isUndefined, matchAll, zBase32Encode } from '@tstdl/base/utils';
import type { NonObjectBufferMode } from '@tstdl/server/utils';
import { createHash } from '@tstdl/server/utils';
import type { TypedReadable } from '@tstdl/server/utils/typed-readable';
import { StringDecoder } from 'string_decoder';
import type { FilmlistMetadata } from './filmlist-metadata';
import type { FilmlistResource } from './filmlist-resource';

/* eslint-disable prefer-named-capture-group */
const METADATA_REGEX = /\{\s*"Filmliste"\s?:\s?(\[(?:\s?"[^"]*?",?){5}\s?\])/u;
const METADATA_DATE_REGEX = /(\d+).(\d+).(\d+),\s(\d+):(\d+)/u;
const ENTRY_REGEX = /(?:"X":(\[(?:"[^"]*?",){16}"(?:\d+|)",(?:"[^"]*?",){2}"(?:false|true)"\])(?:,|}))|(?:"X":(\[(?:"[\w\W]*?",){16}"(?:\d+|)",(?:"[\w\W]*?",){2}"(?:false|true)"\])(?:,|}))|(?:"X"\s:\s(\[(?:\s"[^"]*?",){16}\s"(?:\d+|)"(?:,\s"[^"]*?"){3}\s\])(?:,|\s*}))|(?:"X"\s:\s(\[(?:\s"[\w\W]*?",){16}\s"(?:\d+|)"(?:,\s"[\w\W]*?"){3}\s\])(?:,|\s*}))/ug;
/* eslint-enable prefer-named-capture-group */

export type FilmlistParseResult = FilmlistMetadataParseResult | EntriesParseResult;

export type FilmlistMetadataParseResult = {
  filmlistMetadata: FilmlistMetadata,
  entries: undefined
};

export type EntriesParseResult = {
  filmlistMetadata: undefined,
  entries: FilmlistEntry[]
};

export class Filmlist implements AsyncIterable<FilmlistEntry[]> {
  private readonly streamProvider: () => Promise<TypedReadable<NonObjectBufferMode>>;

  private started: boolean;
  private parseIterable: AsyncIteratorIterableIterator<FilmlistParseResult> | undefined;
  private buffer: string;
  private filmlistMetadata: FilmlistMetadata | undefined;
  private lastChannel: string;
  private lastTopic: string;

  readonly resource: FilmlistResource;

  constructor(resource: FilmlistResource, streamProvider: () => Promise<TypedReadable<NonObjectBufferMode>>) {
    this.resource = resource;
    this.streamProvider = streamProvider;

    this.started = false;
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

      if (isUndefined(item.entries)) {
        throw new Error('this should not happen...');
      }
    }

    throw new Error('could not parse filmlist');
  }

  async *[Symbol.asyncIterator](): AsyncIterator<FilmlistEntry[]> {
    if (this.started) {
      throw new Error('already started iteration');
    }

    this.started = true;
    const iterable = this.getIterable();
    await this.getMetadata();

    for await (const item of iterable) {
      if (isDefined(item.entries)) {
        yield item.entries;
      }
      else if (isUndefined(item.filmlistMetadata)) {
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
    const stream = await this.streamProvider();

    for await (const chunk of stream) {
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
      const entries = this.parseEntries();

      if (entries != undefined) {
        return { filmlistMetadata: undefined, entries };
      }
    }

    return undefined;
  }

  // eslint-disable-next-line max-statements
  private parseFilmlistMetadata(): FilmlistMetadata | undefined {
    const match = METADATA_REGEX.exec(this.buffer);

    if (match == undefined) {
      if (this.buffer.length > 15000) {
        throw new Error('failed parsing filmlist');
      }

      return undefined;
    }

    this.buffer = this.buffer.slice(match.index + match[0]!.length);

    const [
      , // date
      utcDate,
      version,
      , // mSearchVersion,
      id
    ] = JSON.parse(match[1]!) as string[];

    if (version != '3') {
      throw new Error(`unknown filmlist version '${version!}'`);
    }

    const dateMatch = METADATA_DATE_REGEX.exec(utcDate!);

    if (dateMatch == undefined) {
      throw new Error('failed parsing filmlist date');
    }

    const [, day, month, year, hour, minute] = dateMatch;

    const date = new Date(Date.UTC(parseInt(year!, 10), parseInt(month!, 10) - 1, parseInt(day!, 10), parseInt(hour!, 10), parseInt(minute!, 10)));
    const timestamp = date.getTime();

    const filmlist: FilmlistMetadata = {
      id: id!,
      timestamp
    };

    return filmlist;
  }

  private parseEntries(): FilmlistEntry[] | undefined {
    const regex = new RegExp(ENTRY_REGEX); // eslint-disable-line require-unicode-regexp
    const matches = matchAll(regex, this.buffer);

    if (matches.length == 0) {
      return undefined;
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const entries = matches.map((match) => this.filmlistEntryToEntry((match[1] ?? match[2] ?? match[3] ?? match[4])!));

    const lastMatch = matches[matches.length - 1];
    this.buffer = this.buffer.slice((lastMatch!.index) + lastMatch![0]!.length);

    return entries;
  }

  /* eslint-disable camelcase */
  // eslint-disable-next-line max-statements, max-lines-per-function
  private filmlistEntryToEntry(filmlistEntry: string): FilmlistEntry {
    const parsedFilmlistEntry = JSON.parse(filmlistEntry) as string[];

    const [
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
      date_l
      , // url_history,
      , // geo,
      , // is_new
    ] = parsedFilmlistEntry;

    if (channel!.length > 0) {
      this.lastChannel = channel!;
    }

    if (topic!.length > 0) {
      this.lastTopic = topic!;
    }

    const [hoursString, minutesString, secondsString] = rawDuration!.split(':');
    const duration = (parseInt(hoursString!, 10) * 3600) + (parseInt(minutesString!, 10) * 60) + parseInt(secondsString!, 10);
    const timestamp = parseInt(date_l!, 10) * 1000;

    const entry: FilmlistEntry = {
      tag: '',
      channel: this.lastChannel,
      topic: this.lastTopic,
      title: title!,
      timestamp,
      duration,
      description: description!,
      website: url_website!,
      media: []
    };

    if (url_small!.length > 0) {
      const videoUrl = createUrlFromBase(url!, url_small!);
      const video = createVideo(videoUrl);
      entry.media.push(video);
    }

    if (url!.length > 0) {
      const video = createVideo(url!);
      entry.media.push(video);
    }

    if (url_hd!.length > 0) {
      const videoUrl = createUrlFromBase(url!, url_hd!);
      const video = createVideo(videoUrl);
      entry.media.push(video);
    }

    if (url_subtitle!.length > 0) {
      const subtitle = createSubtitle(url_subtitle!);
      entry.media.push(subtitle);
    }

    const hashString = [entry.channel, entry.topic, entry.title, entry.timestamp, entry.duration, entry.website].join('-');
    const idBuffer = createHash('sha1', hashString).toBuffer();
    entry.tag = zBase32Encode(idBuffer.buffer);

    return entry;
  }
  /* eslint-enable camelcase */
}

function createUrlFromBase(baseUrl: string, newUrl: string): string {
  const split = newUrl.split('|');
  return baseUrl.substr(0, parseInt(split[0]!, 10)) + split[1]!;
}
