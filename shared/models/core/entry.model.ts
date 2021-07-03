import type { TypedOmit } from '@tstdl/base/types';
import { dotNotate, dotNotateFlat, dotNotator } from '@tstdl/base/utils';
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
  indexRequiredSince: number | null,
  indexJobTimeout: number | null,
  indexJob: string | null
};

export type NewEntry = NewEntity<Entry>;

export type IndexedEntry = TypedOmit<Entry, 'indexJob' | 'indexJobTimeout' | 'indexRequiredSince'> & {
  date: number,
  time: number,
  metadata: EntryMetadata
};

export const fields = {
  id: dotNotate<IndexedEntry>('id'),
  source: dotNotate<IndexedEntry>('source'),
  tag: dotNotate<IndexedEntry>('tag'),
  channel: dotNotate<IndexedEntry>('channel'),
  topic: dotNotate<IndexedEntry>('topic'),
  title: dotNotate<IndexedEntry>('title'),
  timestamp: dotNotate<IndexedEntry>('timestamp'),
  date: dotNotate<IndexedEntry>('date'),
  time: dotNotate<IndexedEntry>('time'),
  duration: dotNotate<IndexedEntry>('duration'),
  description: dotNotate<IndexedEntry>('description'),
  website: dotNotate<IndexedEntry>('website'),
  firstSeen: dotNotate<IndexedEntry>('firstSeen'),
  lastSeen: dotNotate<IndexedEntry>('lastSeen'),
  mediaType: dotNotator<IndexedEntry>().array('media')('type').notate(),
  mediaUrl: dotNotator<IndexedEntry>().array('media')('url').notate(),
  mediaSize: dotNotator<IndexedEntry>().array('media')('size').notate(),
  mediaQuality: dotNotateFlat<IndexedEntry>('media', 'quality'),
  mediaBitrate: dotNotateFlat<IndexedEntry>('media', 'quality', 'bitrate'),
  videoResolutionWidth: dotNotator<IndexedEntry>().array('media').cast<Video>()('quality').cast<VideoQuality>()('resolution')('width').notate(),
  videoResolutionHeight: dotNotator<IndexedEntry>().array('media').cast<Video>()('quality').cast<VideoQuality>()('resolution')('height').notate()
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
