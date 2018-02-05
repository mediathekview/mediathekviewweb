import { Document, Entry } from '../common/model';
import { AnyIterable } from '../common/utils';

export interface EntryRepository {
  save(entry: Entry): Promise<Document<Entry>>;
  saveMany(entries: Entry[]): Promise<Document<Entry>[]>;

  load(id: string): Promise<Document<Entry> | null>;
  loadMany(ids: AnyIterable<string>): AsyncIterable<Document<Entry>>;

  drop(): Promise<void>;
}
