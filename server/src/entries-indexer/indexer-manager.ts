import { IDatastoreProvider, IKey, ISortedSet, ISet } from '../data-store';
import { DatastoreKeys } from '../data-store-keys';
import config from '../config';
import { random } from '../utils';
import * as Bull from 'bull';
import { ILockProvider, ILock } from '../lock';
import { DistributedLoop } from '../distributed-loop';
import { QueueProvider, IndexEntriesType } from '../queue';

const LATEST_CHECK_INTERVAL = config.importer.latestCheckInterval * 1000;
const FULL_CHECK_INTERVAL = config.importer.fullCheckTimeout * 1000;
const MAX_AGE_DAYS = config.importer.archiveRange;

const JOB_BATCH_SIZE = 1000;

export class IndexerManager {
  private indexEntriesQueue: Bull.Queue;
  private distributedLoop: DistributedLoop;
  private lastIndexedImportID: IKey<number>;
  private trackingSetsSortedSet: ISortedSet<string>;

  constructor(private datastoreProvider: IDatastoreProvider, private lockProvider: ILockProvider, private queueProvider: QueueProvider) {
    this.indexEntriesQueue = queueProvider.getIndexEntriesQueue();
    this.lastIndexedImportID = datastoreProvider.getKey<number>(DatastoreKeys.LastIndexedImportID);
    this.trackingSetsSortedSet = datastoreProvider.getSortedSet<string>(DatastoreKeys.TrackingSetsSortedSet);

    this.distributedLoop = new DistributedLoop('loop:indexer-manager', lockProvider);
  }

  async run() {
    this.distributedLoop.run(() => this.loop(), random(5000, 15000));

    let lastIndexedImportID = await this.lastIndexedImportID.get();
    if (lastIndexedImportID == null) {
      lastIndexedImportID = 0;
    }

    const importsAfterLastIndex = await this.trackingSetsSortedSet.rangeByScore(lastIndexedImportID, false, Number.POSITIVE_INFINITY, true, false);
    const trackingSets = importsAfterLastIndex.map((member) => member.key).map((key) => this.datastoreProvider.getSet(key));

    const unionTrackingSet = this.datastoreProvider.getSet();

    if (trackingSets.length > 0) {
      trackingSets[0].union(unionTrackingSet, ...trackingSets.filter((set, index) => index != 0));
    }

    const trackSize = await unionTrackingSet.size();

    const batchCount = Math.ceil(trackSize / JOB_BATCH_SIZE);

    for (let i = 0; i < batchCount; i++) {
      await this.enqueueIndexEntries(unionTrackingSet.key, JOB_BATCH_SIZE);
    }
  }

  private async loop() {
    await this.indexEntriesQueue.clean(0, 'completed');
  }

  private async enqueueIndexEntries(idsSetKey: string, amount: number) {
    const jobData: IndexEntriesType = { idsSetKey: idsSetKey, amount: amount };
    await this.indexEntriesQueue.add(jobData);
  }
}
