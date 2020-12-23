import type { AggregatedEntry, Entry } from '$shared/models/core';

export interface AggregatedEntryDataSource {
  aggregate(entry: Entry): Promise<AggregatedEntry>;
  aggregateMany(entries: Entry[]): Promise<AggregatedEntry[]>;
}
