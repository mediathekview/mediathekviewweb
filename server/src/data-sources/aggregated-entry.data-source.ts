import { AggregatedEntry, Entry } from '../common/models';

export interface AggregatedEntryDataSource {
  aggregate(entry: Entry): Promise<AggregatedEntry>;
  aggregateMany(entries: Entry[]): Promise<AggregatedEntry[]>;
}
