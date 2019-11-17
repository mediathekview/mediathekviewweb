import { AggregatedEntry } from '../common/models';

export interface AggregatedEntryDataSource {
  load(id: string): Promise<AggregatedEntry | undefined>;
  loadMany(ids: string[]): Promise<AggregatedEntry[]>;
}
