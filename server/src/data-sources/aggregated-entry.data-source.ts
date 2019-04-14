import { AggregatedEntry } from '../common/model';

export interface AggregatedEntryDataSource {
  load(id: string): Promise<AggregatedEntry | undefined>;
  loadMany(ids: string[]): Promise<AggregatedEntry[]>;
}
