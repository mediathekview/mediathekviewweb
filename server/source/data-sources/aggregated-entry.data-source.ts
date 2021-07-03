import type { IndexedEntry, Entry } from '$shared/models/core';

export interface AggregatedEntryDataSource {
  aggregate(entry: Entry): Promise<IndexedEntry>;
  aggregateMany(entries: Entry[]): Promise<IndexedEntry[]>;
}
