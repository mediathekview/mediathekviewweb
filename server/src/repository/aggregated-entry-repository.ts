import { AggregatedEntry, Document } from '../common/model';
import { AnyIterable } from '../common/utils';

export interface AggregatedEntryRepository {
  load(id: string): Promise<AggregatedEntry | null>;
  loadMany(ids: AnyIterable<string>): AsyncIterable<AggregatedEntry>;
}
