import type { Entry, NewEntry } from '$shared/models/core';
import type { EntityRepository } from '@tstdl/database';

export type IndexJob = { jobId: string, entries: Entry[] };

export interface EntryRepository extends EntityRepository<Entry> {
  upsertEntry(entry: NewEntry): Promise<void>;
  upsertEntries(entries: NewEntry[]): Promise<void>;
  hasPendingJob(): Promise<boolean>;
  getIndexJob(count: number, timeout: number): Promise<IndexJob>;
  setIndexJobFinished(jobId: string): Promise<void>;
}
