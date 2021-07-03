import type { IndexedEntry, Entry } from '$shared/models/core';
import { timestampToNumericDate, timestampToTime } from '@tstdl/base/utils';
import type { AggregatedEntryDataSource } from './aggregated-entry.data-source';

export class NonWorkingAggregatedEntryDataSource implements AggregatedEntryDataSource {
  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/require-await
  async aggregate(entry: Entry): Promise<IndexedEntry> {
    return toAggregated(entry);
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/require-await
  async aggregateMany(entries: Entry[]): Promise<IndexedEntry[]> {
    return entries.map((entry) => toAggregated(entry));
  }
}

function toAggregated(entry: Entry): IndexedEntry {
  const aggregatedEntry: IndexedEntry = {
    id: entry.id,
    source: entry.source,
    tag: entry.tag,
    channel: entry.channel,
    topic: entry.topic,
    title: entry.title,
    timestamp: entry.timestamp,
    date: timestampToNumericDate(entry.timestamp),
    time: timestampToTime(entry.timestamp),
    duration: entry.duration,
    description: entry.description,
    website: entry.website,
    firstSeen: entry.firstSeen,
    lastSeen: entry.lastSeen,
    media: entry.media,
    metadata: {
      downloads: 1234,
      plays: 1234,
      comments: 0,
      averageRating: 2.5,
      secondsPlayed: 1234,
      secondsPaused: 1234
    }
  };

  return aggregatedEntry;
}
