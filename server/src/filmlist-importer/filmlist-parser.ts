import { Transform } from 'stream';
import * as Crypto from 'crypto';
import { IEntry, IFilmlistMetadata, IVideo, Video, ISubtitle, Subtitle, Quality } from '../common';

const META_DATA_REGEX = /{"Filmliste":\[".*?","(\d+).(\d+).(\d+),\s(\d+):(\d+)".*?"([0-9a-z]+)"\]/;
const ENTRY_REGEX = /"X":(\["(?:.|[\r\n])*?"\])(?:,|})/;

export class FilmlistParser extends Transform {
  private buffer: string = '';
  private hasMetaData: boolean = false;
  private filmlistMetadata: IFilmlistMetadata;
  private metadataCallback: (filmlistMetadata: IFilmlistMetadata) => void;
  private currentChannel: string = '';
  private currentTopic: string = '';

  constructor(metadataCallback: (filmlistMetadata: IFilmlistMetadata) => void) {
    super({ objectMode: true });

    this.metadataCallback = metadataCallback;
  }

  _transform(chunk: string, encoding: string, callback: (error: null | Error, data?: IEntry) => void) {
    this.buffer += chunk;

    let match: RegExpMatchArray | null;

    if (!this.hasMetaData) {
      match = this.buffer.match(META_DATA_REGEX);

      if (match != null) {
        this.buffer = this.buffer.slice((match.index as number) + match[0].length);

        const [, day, month, year, hour, minute, hash] = match;
        const date = Date.UTC(parseInt(year), parseInt(month), parseInt(day), parseInt(hour), parseInt(minute));
        const timestamp = Math.floor(date.valueOf() / 1000);

        this.filmlistMetadata = { timestamp: timestamp, hash: hash };
        this.metadataCallback(this.filmlistMetadata);

        this.hasMetaData = true;
      }

      return callback(null);
    }

    while ((match = this.buffer.match(ENTRY_REGEX)) != null) {
      this.buffer = this.buffer.slice((match.index as number) + match[0].length);

      const rawFilmlistEntry = match[1];
      const entry = this.rawFilmlistEntryToEntry(rawFilmlistEntry);

      this.push(entry);
    }

    callback(null);
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
        firstSeen: this.filmlistMetadata.timestamp, //has to be merged with Math.min() at indexing
        lastSeen: this.filmlistMetadata.timestamp, //has to be merged with Math.max() at indexing
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

    const hashString = [entry.channel, entry.topic, entry.title, entry.timestamp, entry.duration, entry.description, entry.website, JSON.stringify(entry.media)].join(' _ ');

    entry.id = Crypto.createHash('md5').update(hashString).digest('base64').slice(0, -2).replace('/', 'a').replace('+', 'z');

    return entry;
  }

  createUrlFromBase(baseUrl: string, newUrl: string): string {
    const split = newUrl.split('|');
    return baseUrl.substr(0, parseInt(split[0])) + split[1];
  }
}
