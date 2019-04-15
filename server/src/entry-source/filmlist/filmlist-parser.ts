import { matchAll, zBase32Encode } from '@common-ts/base/utils';
import { NonObjectStringMode } from '@common-ts/server/utils';
import { TypedReadable } from '@common-ts/server/utils/typed-readable';
import * as Crypto from 'crypto';
import { createSubtitle, createVideo, Entry } from '../../common/model';
import { HttpClient } from '../../http';
import { Filmlist, FilmlistResource } from '../../model/filmlist';
import { decompress } from '../../utils';

export type FilmlistParseResult = {
  filmlist: Filmlist,
  entries: undefined
};

export type EntriesParseResult = {
  filmlist: undefined,
  entries: Entry[]
};

type Context = {
  filmlistResource: FilmlistResource,
  buffer: string,
  lastChannel: string,
  lastTopic: string
};

const READ_SIZE = 100 * 1024; // 100 KB
const METADATA_REGEX = /{"Filmliste":\[".*?","(\d+).(\d+).(\d+),\s(\d+):(\d+)".*?"([0-9a-z]+)"\]/;
const ENTRY_REGEX = /"X":(\["(?:.|[\r\n])*?"\])(?:,|})/g;

export async function parseFilmlistResourceFilmlist(filmlistResource: FilmlistResource): Promise<Filmlist> {
  const filmlistResourceParser = parseFilmlistResource(filmlistResource, true);

  for await (const item of filmlistResourceParser) {
    return (item as FilmlistParseResult).filmlist;
  }

  throw new Error('no filmlist yielded');
}

export function parseFilmlistResource(filmlistResource: FilmlistResource, yieldFilmlist: true): AsyncIterableIterator<FilmlistParseResult | EntriesParseResult>;
export function parseFilmlistResource(filmlistResource: FilmlistResource, yieldFilmlist: false): AsyncIterableIterator<EntriesParseResult>;
export async function* parseFilmlistResource(filmlistResource: FilmlistResource, yieldFilmlist: boolean): AsyncIterableIterator<FilmlistParseResult | EntriesParseResult> {
  const { url, compressed } = filmlistResource;

  const httpStream = HttpClient.getStream(url);
  const stream: TypedReadable<NonObjectStringMode> = compressed ? decompress(httpStream) : httpStream;

  let filmlist: Filmlist | undefined;

  const context: Context = {
    filmlistResource,
    buffer: '',
    lastChannel: '',
    lastTopic: ''
  };

  let finished = false;

  try {
    for await (const chunk of stream) { // tslint:disable-line: await-promise
      context.buffer += chunk;

      if (filmlist != undefined) {
        const entries = parseEntries(context, filmlist);

        if (entries != undefined) {
          yield { filmlist: undefined, entries };
        }
      }
      else {
        filmlist = parseFilmlist(context);

        if (filmlist != undefined && yieldFilmlist) {
          yield { filmlist, entries: undefined };
        }
      }
    }

    finished = true;
  }
  finally {
    if (!finished) {
      stream.destroy();
      httpStream.destroy();
    }
  }
}

function parseFilmlist(context: Context): Filmlist | undefined {
  const match = context.buffer.match(METADATA_REGEX);

  if (match == undefined) {
    return undefined;
  }

  context.buffer = context.buffer.slice((match.index as number) + match[0].length);

  const [, day, month, year, hour, minute, id] = match;
  const date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute)));
  const timestamp = date.getTime();

  const filmlist: Filmlist = {
    timestamp,
    id,
    resource: context.filmlistResource
  };

  return filmlist;
}

function parseEntries(context: Context, filmlist: Filmlist): Entry[] | undefined {
  const entries: Entry[] = [];

  const regex = new RegExp(ENTRY_REGEX);
  const matches = matchAll(regex, context.buffer);

  if (matches.length == 0) {
    return undefined;
  }

  for (const match of matches) {
    const filmlistEntry = match[1];
    const entry = filmlistEntryToEntry(context, filmlistEntry, filmlist);

    entries.push(entry);
  }

  const lastMatch = matches[matches.length - 1];
  context.buffer = context.buffer.slice(lastMatch.index + lastMatch[0].length);

  return entries;
}

function filmlistEntryToEntry(context: Context, filmlistEntry: string, filmlist: Filmlist): Entry {
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
    context.lastChannel = channel;
  }

  if (topic.length > 0) {
    context.lastTopic = topic;
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
    channel: context.lastChannel,
    topic: context.lastTopic,
    title,
    timestamp,
    duration,
    description,
    website: url_website,
    firstSeen: filmlist.timestamp,
    lastSeen: filmlist.timestamp,
    media: [],
    source: {
      name: 'filmlist',
      data: {
        filmlistId: filmlist.id
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
  const idBuffer = Crypto.createHash('sha1').update(hashString).digest();
  entry.id = zBase32Encode(idBuffer.buffer);

  return entry;
}

function createUrlFromBase(baseUrl: string, newUrl: string): string {
  const split = newUrl.split('|');
  return baseUrl.substr(0, parseInt(split[0])) + split[1];
}
