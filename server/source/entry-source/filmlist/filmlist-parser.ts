import { createSubtitle, createVideo } from '$shared/models/core';
import type { FilmlistEntry } from '$shared/models/filmlist';
import { AsyncIteratorIterableIterator, millisecondsPerHour, millisecondsPerMinute, millisecondsPerSecond, zBase32Encode } from '@tstdl/base/utils';
import { createHash } from '@tstdl/server/utils';
import { DateTime } from 'luxon';
import type { Readable } from 'stream';
import { StringDecoder } from 'string_decoder';
import type { FilmlistMetadata } from './filmlist-metadata';

export type FilmlistParseResult = {
  id: string,
  timestamp: number,
  entries: AsyncIterableIterator<FilmlistEntry[]>
};

// eslint-disable-next-line max-lines-per-function
export async function parseFilmlist(stream: Readable): Promise<FilmlistParseResult> {
  const stringDecoder = new StringDecoder('utf8');
  const iterator = stream[Symbol.asyncIterator]();
  const streamIterable = new AsyncIteratorIterableIterator(iterator, true);

  let buffer = '';
  let metadata: FilmlistMetadata;

  const parseMetadata = (): FilmlistMetadata => {
    const metadataPrefix = '{"Filmliste":';
    const metadataSuffix = ',"Filmliste":';
    const entriesPrefix = ',"X":';
    const metadataStart = buffer.indexOf(metadataPrefix) + metadataPrefix.length;
    const metadataEnd = buffer.indexOf(metadataSuffix) - 1;
    const entriesStart = buffer.indexOf(entriesPrefix) + entriesPrefix.length;
    const metadataArrayString = buffer.slice(metadataStart, metadataEnd + 1);
    const filmlistMetadata = parseFilmlistMetadata(metadataArrayString);

    buffer = buffer.slice(entriesStart);

    return filmlistMetadata;
  };


  for await (const chunk of streamIterable) {
    buffer += stringDecoder.write(chunk);

    if (buffer.length < 250) {
      continue;
    }

    metadata = parseMetadata();
    break;
  }

  // eslint-disable-next-line max-lines-per-function
  async function* getEntries(): AsyncIterableIterator<FilmlistEntry[]> {
    let lastChannel: string;
    let lastTopic: string;

    const parseEntries = (isLast: boolean = false): FilmlistEntry[] => {
      const rawEntries = buffer.split(',"X":');

      if (rawEntries.length == 0) {
        return [];
      }

      if (!isLast) {
        buffer = rawEntries.pop()!;
      }

      const entries: FilmlistEntry[] = [];

      for (const rawEntry of rawEntries) {
        const entry = parseRawEntry(rawEntry, lastChannel, lastTopic);

        lastChannel = entry.channel;
        lastTopic = entry.topic;

        entries.push(entry);
      }

      return entries;
    };

    for await (const chunk of streamIterable) {
      buffer += stringDecoder.write(chunk);

      if (buffer.length < 250000) {
        continue;
      }

      const entries = parseEntries();

      if (entries.length > 0) {
        yield entries;
      }
    }

    buffer += stringDecoder.end();
    buffer = buffer.slice(0, -1); // removes trailing '}'

    const entries = parseEntries(true);

    if (entries.length > 0) {
      yield entries;
    }
  }

  return {
    id: metadata!.id,
    timestamp: metadata!.timestamp,
    entries: getEntries()
  };
}

function parseFilmlistMetadata(metdataArrayString: string): FilmlistMetadata {
  const [
    , // date
    utcDate,
    version,
    , // mSearchVersion,
    id
  ] = JSON.parse(metdataArrayString) as string[];

  if (version != '3') {
    throw new Error(`unsupported filmlist version '${version!}'`);
  }

  const dateTime = DateTime.fromFormat(utcDate!, 'dd.MM.yyyy, HH:mm', { zone: 'utc' });
  const timestamp = dateTime.toMillis();

  const metadata: FilmlistMetadata = {
    id: id!,
    timestamp
  };

  return metadata;
}

// eslint-disable-next-line max-lines-per-function, max-statements
function parseRawEntry(filmlistEntryString: string, lastChannel: string, lastTopic: string): FilmlistEntry {
  const parsedFilmlistEntry = JSON.parse(filmlistEntryString) as string[];

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

  const [hoursString, minutesString, secondsString] = rawDuration!.split(':');
  const duration = (parseInt(hoursString!, 10) * millisecondsPerHour) + (parseInt(minutesString!, 10) * millisecondsPerMinute) + (parseInt(secondsString!, 10) * millisecondsPerSecond);
  const timestamp = parseInt(date_l!, 10) * 1000;

  const entry: FilmlistEntry = {
    source: 'mediathekview-filmlist',
    tag: '',
    channel: channel!.length > 0 ? channel! : lastChannel,
    topic: topic!.length > 0 ? topic! : lastTopic,
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

function createUrlFromBase(baseUrl: string, newUrl: string): string {
  const split = newUrl.split('|');
  return baseUrl.substr(0, parseInt(split[0]!, 10)) + split[1]!;
}
