import { Entry } from '../common/model';

export interface EntryRepository {
  save(entry: Entry): Promise<void>;
  saveMany(entries: Entry[]): Promise<void>;
  load(id: string): Promise<Entry>;
  loadMany(ids: string[]): Promise<Entry[]>;
}
