import { Entity } from './entity';
import { EntryMetadata } from './entry-metadata';

export type Entry = Entity & {
  channel: string;
  topic: string;
  title: string;
  timestamp: number;
  duration: number;
  description: string;
  website: string;
  firstSeen: number;
  lastSeen: number;
  media: Media[];

  source: {
    identifier: string,
    data?: any
  }
};

export type AggregatedEntry = Entry & {
  date: number;
  time: number;
  metadata: EntryMetadata;
};

export enum Field {
  ID = 'id',
  Channel = 'channel',
  Topic = 'topic',
  Title = 'title',
  Timestamp = 'timestamp',
  Date = 'date',
  Time = 'time',
  Duration = 'duration',
  Description = 'description',
  Website = 'website',
  FirstSeen = 'firstSeen',
  LastSeen = 'lastSeen',
  MediaType = 'media.type',
  MediaUrl = 'media.url',
  MediaSize = 'media.size',
  VideoQuality = 'media.quality',
  AudioQuality = 'media.quality'
}

export const enum MediaType {
  Video = 'video',
  Audio = 'audio',
  Subtitle = 'subtitle'
}

export type Media = Video | Audio | Subtitle;

type MediaBase = {
  type: MediaType;
  url: string;
  size?: number;
};

export type Video = MediaBase & {
  type: MediaType.Video;
  quality: Quality;
};

export type Audio = MediaBase & {
  type: MediaType.Audio;
  quality: Quality;
};

export type Subtitle = MediaBase & {
  type: MediaType.Subtitle;
};

export enum Quality {
  UltraLow = 0,
  VeryLow = 1,
  Low = 2,
  Medium = 3,
  High = 4,
  VeryHigh = 5
}

export function createVideo(url: string, quality: Quality, size?: number): Video {
  const video: Video = {
    type: MediaType.Video,
    url,
    size,
    quality
  };

  return video;
}

export function createAudio(url: string, quality: Quality, size?: number): Audio {
  const audio: Audio = {
    type: MediaType.Audio,
    url,
    size,
    quality
  };

  return audio;
}

export function createSubtitle(url: string, size?: number): Subtitle {
  const subtitle: Subtitle = {
    type: MediaType.Subtitle,
    url,
    size
  };

  return subtitle;
}
