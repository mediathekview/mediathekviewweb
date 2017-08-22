export interface IEntry {
  id: string;
  metadata: IEntryMetadata;

  channel: string;
  topic: string;
  title: string;
  timestamp: number;
  duration: number;
  description: string;
  website: string;
  media: IMedia[];
}

export interface IEntryMetadata {
  lastSeen: number;
  downloads: IUserAction[];
  plays: IUserAction[];
  secondsPlayed: number;
  secondsPaused: number;
}

export interface IUserAction {
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
