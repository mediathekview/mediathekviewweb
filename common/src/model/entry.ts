import { Entity } from './entity';
import { EntryMetadata } from './entry-metadata';

export type Entry = Entity & {
  channel: string;
  topic: string;
  title: string;
  timestamp: Date;
  duration: number;
  description: string;
  website: string;
  media: Media[];

  sourceIdentifier: string;
  sourceData?: any;
}

export type AggregatedEntry = Entry & {
  metadata: EntryMetadata;
}

export const Field = {
  ID: 'id',
  Channel: 'channel',
  Topic: 'topic',
  Title: 'title',
  Timestamp: 'timestamp',
  Duration: 'duration',
  Description: 'description',
  Website: 'website',
  MediaType: 'media.type',
  MediaUrl: 'media.url',
  MediaSize: 'media.size',
  VideoQuality: 'media.quality',
  AudioQuality: 'media.quality',
  LastSeen: 'metadata.lastSeen'
}

export enum MediaType {
  Video = 0,
  Audio = 1,
  Subtitle = 2
}

export interface Media {
  type: MediaType;
  url: string;
  size: number | null;
}

export type Video = Media & {
  type: MediaType.Video;
  quality: Quality;
}

export type Audio = Media & {
  type: MediaType.Audio;
  quality: Quality;
}

export type Subtitle = Media & {
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

export class MediaFactory {
  static createVideo(url: string, size: number | null, quality: Quality): Video {
    return {
      type: MediaType.Video,
      url: url,
      size: size,
      quality: quality
    }
  }

  static createAudio(url: string, size: number | null, quality: Quality): Audio {
    return {
      type: MediaType.Audio,
      url: url,
      size: size,
      quality: quality
    }
  }
}
