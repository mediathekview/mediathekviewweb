export type Entry = {
  id: string;
  metadata: EntryMetadata;

  channel: string;
  topic: string;
  title: string;
  timestamp: number;
  duration: number;
  description: string;
  website: string;
  media: IMedia[];
}

export enum Field {
  ID = 'id',
  Channel = 'channel',
  Topic = 'topic',
  Title = 'title',
  Timestamp = 'timestamp',
  Duration = 'duration',
  Description = 'description',
  Website = 'website',
  MediaType = 'media.type',
  MediaUrl = 'media.url',
  MediaSize = 'media.size',
  VideoQuality = 'media.quality',
  AudioQuality = 'media.quality',
  LastSeen = 'metadata.lastSeen'
}

export type EntryMetadata = {
  lastSeen: number;
  downloads: UserAction[];
  plays: UserAction[];
  secondsPlayed: number;
  secondsPaused: number;
}

export type UserAction = {
  userID: string;
  timestamp: number;
}

export enum MediaType {
  Video = 0,
  Audio = 1,
  Subtitle = 2
}

export interface IMedia {
  type: MediaType;
  url: string;
  size: number;
}

export interface IVideo extends IMedia {
  quality: Quality;
}

export class Video implements IVideo {
  type: MediaType = MediaType.Video;
  url: string;
  size: number;
  quality: Quality;

  constructor(quality: Quality, url: string, size: number) {
    this.quality = quality;
    this.url = url;
    this.size = size;
  }
}

export interface IAudio extends IMedia {
  quality: Quality;
}

export interface ISubtitle extends IMedia {
}

export class Subtitle implements ISubtitle {
  type: MediaType = MediaType.Subtitle;
  url: string;
  size: number;

  constructor(url: string, size: number) {
    this.url = url;
    this.size = size;
  }
}

export enum Quality {
  UltraLow = 0,
  VeryLow = 1,
  Low = 2,
  Medium = 3,
  High = 4,
  VeryHigh = 5
}
