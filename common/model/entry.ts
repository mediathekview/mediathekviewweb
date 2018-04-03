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
  media: Media[];
  lastSeen: number;

  source: {
    identifier: string,
    data?: any
  };
}

export type AggregatedEntry = Entry & {
  time: number;
  metadata: EntryMetadata;
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
  LastSeen = 'lastSeen',
  MediaType = 'media.type',
  MediaUrl = 'media.url',
  MediaSize = 'media.size',
  VideoQuality = 'media.quality',
  AudioQuality = 'media.quality'
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
      url,
      size,
      quality
    };
  }

  static createAudio(url: string, size: number | null, quality: Quality): Audio {
    return {
      type: MediaType.Audio,
      url,
      size,
      quality
    };
  }

  static createSubtitle(url: string, size: number | null): Subtitle {
    return {
      type: MediaType.Subtitle,
      url,
      size
    };
  }
}
