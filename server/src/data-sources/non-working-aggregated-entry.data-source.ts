import { AggregatedEntry, Entry } from '../common/models';
import { AggregatedEntryDataSource } from './aggregated-entry.data-source';

export class NonWorkingAggregatedEntryDataSource implements AggregatedEntryDataSource {
  async aggregate(entry: Entry): Promise<AggregatedEntry> {
    return this.toAggregated(entry);
  }

  async aggregateMany(entries: Entry[]): Promise<AggregatedEntry[]> {
    return entries.map((entry) => this.toAggregated(entry));
  }

  private toAggregated(entry: Entry): AggregatedEntry {
    const aggregatedEntry = {
      ...entry,
      date: this.getDateTimestamp(entry.timestamp),
      time: this.getTime(entry.timestamp),

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

  private getDateTimestamp(timestamp: number): number {
    const date = new Date(timestamp * 1000);
    const dateWithoutTime = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

    return Math.floor(dateWithoutTime.valueOf() / 1000);
  }

  private getTime(timestamp: number): number {
    return timestamp % 86400000;
  }
}
