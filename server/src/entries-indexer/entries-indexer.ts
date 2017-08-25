import { IDatastoreProvider, IKey, IMap, ISortedSet, ISet } from '../data-store';
import { DatastoreKeys } from '../data-store-keys';
import { IEntry, IFilmlistMetadata } from '../common';
import config from '../config';
import { random } from '../utils';
import * as Bull from 'bull';
import { ILockProvider, ILock } from '../lock';
import { DistributedLoop } from '../distributed-loop';
import { QueueProvider, IndexEntriesType } from '../queue';
import { ISearchEngine, SearchEngineEntry } from '../search-engine';

const BATCH_SIZE = 100;

export class EntriesIndexer {
  private indexEntriesQueue: Bull.Queue;
  private entryMap: IMap<IEntry>;

  constructor(private datastoreProvider: IDatastoreProvider, private searchEngine: ISearchEngine<IEntry>, private queueProvider: QueueProvider) {
    this.indexEntriesQueue = queueProvider.getIndexEntriesQueue();
    this.entryMap = datastoreProvider.getMap(DatastoreKeys.EntryMap);
  }

  run() {
    this.indexEntriesQueue.process(1, (job) => this.process(job));
  }

  private async process(job: Bull.Job) {
    const data: IndexEntriesType = job.data;

    console.log(job.id, job.data);

    const idsSet = this.datastoreProvider.getSet<string>(data.idsSetKey);

    let left = data.amount;

    while (left > 0) {
      const entryIDs = await idsSet.pop(BATCH_SIZE);
      left -= BATCH_SIZE;

      const result = await this.entryMap.getMany(...entryIDs);
      const entries = result.filter((r) => r != null).map((r) => r.value as IEntry);

      await this.index(entries);
    }
  }

  private async index(entries: IEntry[]) {
    const searchEngineEntries: SearchEngineEntry<IEntry>[] = [];

    for (const entry of entries) {
      const searchEngineEntry: SearchEngineEntry<IEntry> = {
        id: entry.id,
        document: entry
      }

      searchEngineEntries.push(searchEngineEntry);
    }

    await this.searchEngine.index(...searchEngineEntries);
  }
}
