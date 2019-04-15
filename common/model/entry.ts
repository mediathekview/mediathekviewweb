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
    name: string,
    data?: any
  }
};

export type AggregatedEntry = Entry & {
  date: number;
  time: number;
  metadata: EntryMetadata;
};

export enum Field {
  Id = 'id',
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
  VideoResolutionWidth = 'media.quality.resolution.width',
  VideoResolutionHeight = 'media.quality.resolution.height',
  VideoBitrate = 'media.quality.bitrate',
  AudioQuality = 'media.quality',
  AudioBitrate = 'media.quality.bitrate'
}

export const fields = Object.values(Field);

export enum MediaType {
  Video = 'video',
  Audio = 'audio',
  Subtitle = 'subtitle'
}

export type Media = Video | Audio | Subtitle;

type MediaBase = {
  type: MediaType;
  url: string;
  size: number | null;
};

export type Video = MediaBase & {
  type: MediaType.Video;
  quality: VideoQuality | null;
};

export type Audio = MediaBase & {
  type: MediaType.Audio;
  quality: AudioQuality | null;
};

export type Subtitle = MediaBase & {
  type: MediaType.Subtitle;
};

export type VideoQuality = {
  resolution: {
    width: number,
    height: number
  },
  bitrate: number
};

export type AudioQuality = {
  bitrate: number
};

export function createVideo(url: string, quality: VideoQuality | null = null, size: number | null = null): Video {
  const video: Video = {
    type: MediaType.Video,
    url,
    size,
    quality
  };

  return video;
}

export function createAudio(url: string, quality: AudioQuality | null = null, size: number | null = null): Audio {
  const audio: Audio = {
    type: MediaType.Audio,
    url,
    size,
    quality
  };

  return audio;
}

export function createSubtitle(url: string, size: number | null = null): Subtitle {
  const subtitle: Subtitle = {
    type: MediaType.Subtitle,
    url,
    size
  };

  return subtitle;
}
