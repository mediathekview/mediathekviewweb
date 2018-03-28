import { Entry } from '../common/model';
import { AnyIterable } from '../common/utils';

export interface EntryRepository {
  save(entry: Entry): Promise<Entry>;
  saveMany(entries: Entry[]): AsyncIterable<Entry>;

  load(id: string): Promise<Entry | null>;
  loadMany(ids: AnyIterable<string>): AsyncIterable<Entry>;

  drop(): Promise<void>;
}
