import * as Crypto from 'crypto';
import { Readable } from 'stream';

import { StreamIterable } from '../../utils/stream-iterable';
import { Entry, FilmlistMetadata, Video, Subtitle, Quality, MediaFactory } from '../../common/model';
import { base62Encode } from '../../utils';
import { encode } from 'punycode';

const META_DATA_REGEX = /{"Filmliste":\[".*?","(\d+).(\d+).(\d+),\s(\d+):(\d+)".*?"([0-9a-z]+)"\]/;
const ENTRY_REGEX = /"X":(\["(?:.|[\r\n])*?"\])(?:,|})/;

const READ_SIZE = 100 * 1024; // 100 KB

export class FilmlistParser implements AsyncIterable<Entry[]> {
  private readonly stream: Readable;
  private readonly metadataCallback: (metadata: FilmlistMetadata) => void;

  private inputBuffer: string;
  private outputBuffer: Entry[];
  private currentChannel: string;
  private currentTopic: string;

  metadata: FilmlistMetadata | null;

  constructor(stream: Readable)
  constructor(stream: Readable, metadataCallback: (metadata: FilmlistMetadata) => void)
  constructor(stream: Readable, metadataCallback: (metadata: FilmlistMetadata) => void = () => { }) {
    this.stream = stream;
    this.metadataCallback = metadataCallback;

    this.inputBuffer = '';
    this.outputBuffer = [];
    this.currentChannel = '';
    this.currentTopic = '';
    this.metadata = null;
  }

  async *[Symbol.asyncIterator](): AsyncIterableIterator<Entry[]> {
    const streamIterable = new StreamIterable<string>(this.stream, READ_SIZE);

    for await (const chunk of streamIterable) {
      this.handleChunk(chunk);

      yield this.outputBuffer;
      this.outputBuffer = [];
    }
  }

  private handleChunk(chunk: string) {
    const parseMetadata = this.metadata == null;

    this.inputBuffer += chunk;
    this.inputBuffer = this.parseBuffer(this.inputBuffer, parseMetadata);
  }

  private parseBuffer(buffer: string, parseMetadata: boolean): string {
    let match: RegExpMatchArray | null;

    if (parseMetadata) {
      const result = this.parseMetadata(buffer);

      if (result != null) {
        this.metadata = result.metadata;
        buffer = result.buffer;
      }
    }

    const result = this.parseEntries(buffer);
    this.outputBuffer = this.outputBuffer.concat(result.entries);
    buffer = result.buffer;

    return buffer;
  }

  private parseMetadata(buffer: string): { metadata: FilmlistMetadata, buffer: string } | null {
    const match = buffer.match(META_DATA_REGEX);

    if (match != null) {
      buffer = buffer.slice((match.index as number) + match[0].length);

      const [, day, month, year, hour, minute, hash] = match;
      const date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute)));

      const timestamp = Math.floor(date.valueOf() / 1000);

      const metadata: FilmlistMetadata = { timestamp: timestamp, hash: hash };
      return { metadata: metadata, buffer: buffer };
    }

    return null;
  }

  private parseEntries(buffer: string): { entries: Entry[], buffer: string } {
    const entries: Entry[] = [];

    let match: RegExpMatchArray | null;
    while ((match = buffer.match(ENTRY_REGEX)) != null) {
      buffer = buffer.slice((match.index as number) + match[0].length);

      const filmlistEntry = match[1];
      const entry = this.filmlistEntryToEntry(filmlistEntry);

      entries.push(entry);
    }

    return { entries: entries, buffer };
  }

  private filmlistEntryToEntry(filmlistEntry: string): Entry {
    const parsedFilmlistEntry: string[] = JSON.parse(filmlistEntry);

    const [
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
      title: title,
      timestamp: timestamp,
      duration: duration,
      description: description,
      website: url_website,
      media: [],
      lastSeen: this.metadata!.timestamp,

      source: {
        identifier: 'filmlist',
        data: this.metadata
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

    const urlsString = `${url_small}_${url}_${url_hd}`;
    const hashString = [entry.channel, entry.topic, entry.title, entry.timestamp, entry.duration, entry.website, urlsString].join(' _ ');

    const idBuffer = Crypto.createHash('sha1').update(hashString).digest();
    entry.id = base62Encode(idBuffer);

    return entry;
  }

  private createUrlFromBase(baseUrl: string, newUrl: string): string {
    const split = newUrl.split('|');
    return baseUrl.substr(0, parseInt(split[0])) + split[1];
  }
}
