export interface FilmlisteInfo {
  timestamp: number;
}

export interface Entry {
  id?: string;
  metadata?: EntryMetadata;

  channel: string;
  topic: string;
  title: string;
  timestamp: number;
  duration: number;
  description: string;
  website: string;
  media: IMedia[];
}

export interface EntryMetadata {
  firstSeen: number;
  lastSeen: number;
  downloads: number;
  plays: number;
  minutesPlayed: number;
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
