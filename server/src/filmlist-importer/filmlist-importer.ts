import { IDatastoreProvider, IKey, ISet, ISortedSet, SortedSetMember, IMap, AggregationMode } from '../data-store';
import { IFilmlist } from './filmlist-interface';
import { IEntry, IFilmlistMetadata } from '../common';
import { FilmlistParser } from './filmlist-parser';
import { IFilmlistProvider } from './filmlist-provider-interface';
import config from '../config';
import { random } from '../utils';
import * as Bull from 'bull';
import { ILockProvider, ILock } from '../lock';
import { QueueProvider, ImportQueueType } from '../queue';
import { HttpFilmlist } from './http-filmlist';
import { DatastoreKeys } from '../data-store-keys';

export class FilmlistImporter {
  private importQueue: Bull.Queue;
  private importedFilmlistTimestamps: ISet<number>;
  private entryMap: IMap<IEntry>;
  private entryIDTimestampSortedSet: ISortedSet<string>;

  constructor(private datastoreProvider: IDatastoreProvider, private queueProvider: QueueProvider) {
    this.importQueue = queueProvider.getImportQueue();
    this.importedFilmlistTimestamps = datastoreProvider.getSet(DatastoreKeys.ImportedFilmlistTimestamps);
    this.entryMap = datastoreProvider.getMap(DatastoreKeys.EntryMap);
    this.entryIDTimestampSortedSet = datastoreProvider.getSortedSet(DatastoreKeys.EntryIDTimestampSortedSet);
  }

  run() {
    this.importQueue.process(1, (job) => this.process(job));
  }

  private async process(job: Bull.Job) {
    const data: ImportQueueType = job.data;

    let filmlist: IFilmlist;
    let metadata: IFilmlistMetadata | undefined;

    if (data.ressource.startsWith('http')) {
      filmlist = new HttpFilmlist(data.ressource, data.timestamp);
    } else {
      return Promise.reject(new Error(`no filmlist-handler for ressource ${data.ressource} available`));
    }

    const parser = new FilmlistParser(filmlist, (_metadata) => metadata = _metadata);

    const tempEntryIDTimestampSortedSet = this.datastoreProvider.getSortedSet();

    let sortedSetBuffer: SortedSetMember<string>[] = [];
    const mapBuffer: Map<string, IEntry> = new Map();

    for await (const entry of parser.parse()) {
      if (metadata == undefined) {
        return Promise.reject(new Error('no filmlist-metadata emitted, something is wrong'));
      }

      sortedSetBuffer.push({ key: entry.id, score: metadata.timestamp });
      mapBuffer.set(entry.id, entry);

      if (sortedSetBuffer.length >= 250) {
        const transaction = this.datastoreProvider.getTransaction();
        tempEntryIDTimestampSortedSet.transact(transaction);
        this.entryMap.transact(transaction);

        tempEntryIDTimestampSortedSet.add(...sortedSetBuffer);
        this.entryMap.set(mapBuffer);

        tempEntryIDTimestampSortedSet.endTransact();
        this.entryMap.endTransact();

        await transaction.exec();

        sortedSetBuffer = [];
        mapBuffer.clear();
      }
    }

    const transaction = this.datastoreProvider.getTransaction();
    tempEntryIDTimestampSortedSet.transact(transaction);
    tempEntryIDTimestampSortedSet.union(this.entryIDTimestampSortedSet, AggregationMode.Max, this.entryIDTimestampSortedSet);
    tempEntryIDTimestampSortedSet.delete();
    tempEntryIDTimestampSortedSet.endTransact();

    await transaction.exec();

    await this.importedFilmlistTimestamps.add(data.timestamp);
  }
}
