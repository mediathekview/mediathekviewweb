import { AggregatedEntry } from '../common/model';

export interface AggregatedEntryRepository {
  load(id: string): Promise<AggregatedEntry | undefined>;
  loadMany(ids: string[]): AsyncIterable<AggregatedEntry>;
}
