export interface IFilmlisteInfo {
  timestamp: number;
  entriesCount: number;
}

export interface IEntry {
  id: string;
  metadata?: IEntryMetadata;

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
  firstSeen: number;
  lastSeen: number;
  downloads: number;
  plays: number;
  secondsPlayed: number;
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

export interface IAudio extends IMedia {
  quality: Quality;
}

export interface ISubtitle extends IMedia {
}

export enum Quality {
  UltraLow = 0,
  VeryLow = 1,
  Low = 2,
  Medium = 3,
  High = 4,
  VeryHigh = 5
}
