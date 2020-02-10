import { Entry } from '../common/models';

export type IndexJob = { jobId: string, entries: Entry[] };

export interface EntryRepository {
  save(entry: Entry): Promise<void>;
  saveMany(entries: Entry[]): Promise<void>;
  load(id: string): Promise<Entry>;
  loadMany(ids: string[]): Promise<Entry[]>;
  getIndexJob(count: number, timeout: number): Promise<IndexJob>;
  setIndexJobFinished(jobId: string): Promise<void>;
}
