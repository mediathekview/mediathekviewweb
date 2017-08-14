import { Transform } from 'stream';
import * as Crypto from 'crypto';
import { IFilmlist } from './filmlist-interface';
import { IEntry, IFilmlistMetadata, IVideo, Video, ISubtitle, Subtitle, Quality } from '../common';

const META_DATA_REGEX = /{"Filmliste":\[".*?","(\d+).(\d+).(\d+),\s(\d+):(\d+)".*?"([0-9a-z]+)"\]/;
const ENTRY_REGEX = /"X":(\["(?:.|[\r\n])*?"\])(?:,|})/;

export class FilmlistParser {
  private inputBuffer: string = '';
  private outputBuffer: IEntry[] = [];
  private end: boolean = false;
  private error: Error | null = null;
  private currentChannel: string = '';
  private currentTopic: string = '';

  private dataPromise: Promise<void>;
  private resolve: () => void;
  private reject: (reason: any) => void;

  metadata: IFilmlistMetadata | null = null;

  constructor(private filmlist: IFilmlist, private metadataCallback: (metadata: IFilmlistMetadata) => void) {
  }

  async *parse(): AsyncIterableIterator<IEntry> {
    this.filmlist.getStream()
      .on('data', (chunk: string) => this.handleChunk(chunk))
      .on('end', () => this.end = true)
      .on('error', (error) => this.reject(error));

    while (!this.end) {
      await this.dataPromise;
      yield* this.outputBuffer;
      this.outputBuffer = [];

      this.dataPromise = new Promise((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
      });
    }
  }

  private handleChunk(chunk: string) {
    this.inputBuffer += chunk;
    this.parseBuffer();
    this.resolve();
  }

  private parseBuffer() {
    let match: RegExpMatchArray | null;

    if (this.metadata == null) {
      match = this.inputBuffer.match(META_DATA_REGEX);

      if (match != null) {
        this.inputBuffer = this.inputBuffer.slice((match.index as number) + match[0].length);

        const [, day, month, year, hour, minute, hash] = match;
        const date = Date.UTC(parseInt(year), parseInt(month), parseInt(day), parseInt(hour), parseInt(minute));
        const timestamp = Math.floor(date.valueOf() / 1000);

        this.metadata = { timestamp: timestamp, hash: hash };
        this.metadataCallback(this.metadata);
      }
    }

    while ((match = this.inputBuffer.match(ENTRY_REGEX)) != null) {
      this.inputBuffer = this.inputBuffer.slice((match.index as number) + match[0].length);

      const rawFilmlistEntry = match[1];
      const entry = this.rawFilmlistEntryToEntry(rawFilmlistEntry);

      this.outputBuffer.push(entry);
    }
  }

  private rawFilmlistEntryToEntry(raw: string): IEntry {
    const parsedFilmlistEntry: string[] = JSON.parse(raw);

    const [channel, topic, title, date, time, rawDuration, size, description, url, url_website, url_subtitle, url_rtmp, url_small, url_rtmp_small, url_hd, url_rtmp_hd, date_l, url_history, geo, is_new] = parsedFilmlistEntry;

    if (channel.length > 0) {
      this.currentChannel = channel;
    }
    if (topic.length > 0) {
      this.currentTopic = topic;
    }

    const [hoursString, minutesString, secondsString] = rawDuration.split(':');
    const duration = (parseInt(hoursString) * 3600) + (parseInt(minutesString) * 60) + parseInt(secondsString);

    const timestamp = parseInt(date_l);

    const entry: IEntry = {
      id: '',
      metadata: {
        firstSeen: (this.metadata as IFilmlistMetadata).timestamp, //has to be merged with Math.min() at indexing
        lastSeen: (this.metadata as IFilmlistMetadata).timestamp, //has to be merged with Math.max() at indexing
      },

      channel: this.currentChannel,
      topic: this.currentTopic,
      title: title,
      timestamp: timestamp,
      duration: duration,
      description: description,
      website: url_website,
      media: []
    }

    if (url_small.length > 0) {
      entry.media.push(new Video(Quality.Low, this.createUrlFromBase(url, url_small), -1));
    }
    if (url.length > 0) {
      entry.media.push(new Video(Quality.Medium, url, -1));
    }
    if (url_hd.length > 0) {
      entry.media.push(new Video(Quality.High, this.createUrlFromBase(url, url_hd), -1));
    }

    const hashString = [entry.channel, entry.topic, entry.title, entry.timestamp, entry.duration, entry.website].join(' _ ');

    entry.id = Crypto.createHash('md5').update(hashString).digest('base64').slice(0, -2).replace('/', 'a').replace('+', 'z');

    return entry;
  }

  private createUrlFromBase(baseUrl: string, newUrl: string): string {
    const split = newUrl.split('|');
    return baseUrl.substr(0, parseInt(split[0])) + split[1];
  }
}
