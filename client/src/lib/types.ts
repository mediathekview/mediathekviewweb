export type VideoQuality = 'HD' | 'SD' | 'LQ';
export type SortBy = 'timestamp' | 'duration' | 'channel' | 'topic' | 'title';
export type SortOrder = 'asc' | 'desc';

export function isSortBy(value: any): value is SortBy {
  return typeof value === 'string' && ['timestamp', 'duration', 'channel', 'topic', 'title'].includes(value);
}

export function isSortOrder(value: any): value is SortOrder {
  return value === 'asc' || value === 'desc';
}

export type ParsedQuery = {
  channels: string[][],
  topics: string[][],
  titles: string[][],
  descriptions: string[][],
  generics: string[],
  duration_min?: number,
  duration_max?: number,
};

export type ResultEntry = {
  id: string,
  channel: string,
  topic: string,
  title: string,
  description: string,
  timestamp: number,
  duration: number,
  size: number,
  url_website: string,
  url_subtitle: string,
  url_video: string,
  url_video_low: string,
  url_video_hd: string,
};

export type QueryResult = {
  results: ResultEntry[],
  queryInfo: {
    filmlisteTimestamp: number,
    searchEngineTime: number,
    totalResults: number,
    resultCount: number,
  },
};

export type VideoPayload = {
  channel: string;
  topic: string;
  title: string;
  url: string;
  quality: VideoQuality;
  url_subtitle?: string;
};
