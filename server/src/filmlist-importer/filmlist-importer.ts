import { IDatastoreProvider, IKey, ISet, ISortedSet, SortedSetMember, IMap, Aggregation } from '../data-store';
import { IFilmlist } from './filmlist-interface';
import { IEntry, IFilmlistMetadata } from '../common';
import { FilmlistParser } from './filmlist-parser';
import config from '../config';
import { random } from '../utils';
import * as Bull from 'bull';
import { QueueProvider, ImportQueueType } from '../queue';
import { HttpFilmlist } from './http-filmlist';
import { DatastoreKeys } from '../data-store-keys';

export class FilmlistImporter {
  private importQueue: Bull.Queue;
  private importedFilmlistTimestamps: ISet<number>;
  private importIDCounter: IKey<number>;
  private entryMap: IMap<IEntry>;
  private entryIDTimestampSortedSet: ISortedSet<string>;
  private trackingSets: ISortedSet<string>;

  constructor(private datastoreProvider: IDatastoreProvider, private queueProvider: QueueProvider) {
    this.importQueue = queueProvider.getImportQueue();
    this.importedFilmlistTimestamps = datastoreProvider.getSet(DatastoreKeys.ImportedFilmlistTimestamps);
    this.entryMap = datastoreProvider.getMap(DatastoreKeys.EntryMap);
    this.entryIDTimestampSortedSet = datastoreProvider.getSortedSet(DatastoreKeys.EntryIDTimestampSortedSet);
    this.importIDCounter = datastoreProvider.getKey(DatastoreKeys.ImportIDCounter);
    this.trackingSets = datastoreProvider.getSortedSet<string>(DatastoreKeys.TrackingSetsSortedSet);
  }

  run() {
    this.importQueue.process(1, (job) => this.process(job));
  }

  private async process(job: Bull.Job) {
    const data: ImportQueueType = job.data;
    const importID = await this.importIDCounter.increment();
    const trackingSet = this.datastoreProvider.getSet<string>(DatastoreKeys.getTrackingSet(importID));

    console.log('importing', importID, data.ressource);

    let filmlist: IFilmlist;
    let metadata: IFilmlistMetadata | undefined;

    if (data.ressource.startsWith('http')) {
      filmlist = new HttpFilmlist(data.ressource, data.timestamp);
    } else {
      throw new Error(`no filmlist-handler for ressource ${data.ressource} available`);
    }

    const parser = new FilmlistParser(filmlist, (_metadata) => metadata = _metadata);

    let sortedSetBuffer: SortedSetMember<string>[] = [];
    const mapBuffer: Map<string, IEntry> = new Map();

    let counter = 0;
    for await (const entry of parser.parse()) {
      if (metadata == undefined) {
        throw new Error('no filmlist-metadata emitted, something is wrong');
      }

      sortedSetBuffer.push({ key: entry.id, score: metadata.timestamp });
      mapBuffer.set(entry.id, entry);

      if (sortedSetBuffer.length >= 250) {
        await this.flushBuffer(sortedSetBuffer, mapBuffer, metadata, trackingSet);
      }

      if (++counter % 1000 == 0) {
        console.log(counter);
      }
    }
    await this.flushBuffer(sortedSetBuffer, mapBuffer, metadata as IFilmlistMetadata, trackingSet);

    console.log(counter);

    await this.trackingSets.add([{ key: trackingSet.key, score: importID }]);
    await this.importedFilmlistTimestamps.add(data.timestamp);
  }

  private async flushBuffer(sortedSetBuffer: SortedSetMember<string>[], mapBuffer: Map<string, IEntry>, metadata: IFilmlistMetadata, trackingSet: ISet<string>) {
    const transaction = this.datastoreProvider.getTransaction();
    this.entryIDTimestampSortedSet.transact(transaction);
    this.entryMap.transact(transaction);

    this.entryMap.set(mapBuffer, { set: this.entryIDTimestampSortedSet, lessThan: metadata.timestamp });
    this.entryIDTimestampSortedSet.add(sortedSetBuffer, { aggregation: Aggregation.Max, trackingSet: trackingSet });

    this.entryIDTimestampSortedSet.endTransact();
    this.entryMap.endTransact();

    await transaction.exec();

    sortedSetBuffer.length = 0;
    mapBuffer.clear();
  }
}
