import { dotNotation, dotNotator } from '@tstdl/base/utils';
import type { Entity, NewEntity } from '@tstdl/database';
import type { EntryMetadata } from './entry-metadata.model';

export type Entry = Entity & {
  source: string,
  tag: string,
  channel: string,
  topic: string,
  title: string,
  timestamp: number,
  duration: number,
  description: string,
  website: string,
  firstSeen: number,
  lastSeen: number,
  media: Media[],
  indexRequiredSince?: number,
  indexJobTimeout?: number,
  indexJob?: string
};

export type NewEntry = NewEntity<Entry>;

export type AggregatedEntry = Entry & {
  date: number,
  time: number,
  metadata: EntryMetadata
};

export type PublicEntry = Omit<AggregatedEntry, 'source' | 'indexJob' | 'indexJobTimeout' | 'indexRequiredSince'>;

export const fields = {
  id: dotNotation<AggregatedEntry>('id'),
  source: dotNotation<AggregatedEntry>('source'),
  tag: dotNotation<AggregatedEntry>('tag'),
  channel: dotNotation<AggregatedEntry>('channel'),
  topic: dotNotation<AggregatedEntry>('topic'),
  title: dotNotation<AggregatedEntry>('title'),
  timestamp: dotNotation<AggregatedEntry>('timestamp'),
  date: dotNotation<AggregatedEntry>('date'),
  time: dotNotation<AggregatedEntry>('time'),
  duration: dotNotation<AggregatedEntry>('duration'),
  description: dotNotation<AggregatedEntry>('description'),
  website: dotNotation<AggregatedEntry>('website'),
  firstSeen: dotNotation<AggregatedEntry>('firstSeen'),
  lastSeen: dotNotation<AggregatedEntry>('lastSeen'),
  mediaType: dotNotator<AggregatedEntry>().array('media')('type').notate(),
  mediaUrl: dotNotator<AggregatedEntry>().array('media')('url').notate(),
  mediaSize: dotNotator<AggregatedEntry>().array('media')('size').notate(),
  videoQuality: dotNotator<AggregatedEntry>().array('media').cast<Video>()('quality').notate(),
  videoResolutionWidth: dotNotator<AggregatedEntry>().array('media').cast<Video>()('quality').cast<VideoQuality>()('resolution')('width').notate(),
  videoResolutionHeight: dotNotator<AggregatedEntry>().array('media').cast<Video>()('quality').cast<VideoQuality>()('resolution')('height').notate(),
  videoBitrate: dotNotator<Entry>().array('media').cast<Video>()('quality').cast<VideoQuality>()('bitrate'),
  audioQuality: dotNotator<AggregatedEntry>().array('media').cast<Audio>()('quality').notate(),
  audioBitrate: dotNotator<Entry>().array('media').cast<Audio>()('quality').cast<AudioQuality>()('bitrate'),
  indexRequiredSince: dotNotation<AggregatedEntry>('indexRequiredSince'),
  indexJobTimeout: dotNotation<AggregatedEntry>('indexJobTimeout'),
  indexJob: dotNotation<AggregatedEntry>('indexJob')
};

export enum MediaType {
  Video = 'video',
  Audio = 'audio',
  Subtitle = 'subtitle'
}

export type Media = Video | Audio | Subtitle;

type MediaBase = {
  type: MediaType,
  url: string,
  size: number | null
};

export type Video = MediaBase & {
  type: MediaType.Video,
  quality: VideoQuality | null
};

export type Audio = MediaBase & {
  type: MediaType.Audio,
  quality: AudioQuality | null
};

export type Subtitle = MediaBase & {
  type: MediaType.Subtitle
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
