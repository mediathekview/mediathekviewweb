import type { EntryRepository } from '$repositories/entry.repository';
import type { Entry, NewEntry } from '$shared/models/core';
import { fields } from '$shared/models/core';
import type { Logger } from '@tstdl/base/logger';
import { Alphabet, currentTimestamp, getRandomString } from '@tstdl/base/utils';
import type { Collection, FilterQuery, TypedIndexSpecification, UpdateQuery } from '@tstdl/mongo';
import { getNewDocumentId, MongoEntityRepository, noopTransformer } from '@tstdl/mongo';

const indexes: TypedIndexSpecification<Entry>[] = [
  { name: 'source_tag', key: { [fields.source]: 1, [fields.tag]: 1 }, unique: true },
  { name: 'firstSeen', key: { [fields.firstSeen]: 1 } },
  { name: 'lastSeen', key: { [fields.lastSeen]: 1 } },
  { name: 'indexRequiredSince', key: { [fields.indexRequiredSince]: 1 } },
  { name: 'indexJobTimeout', key: { [fields.indexJobTimeout]: 1 } },
  { name: 'indexJob', key: { [fields.indexJob]: 1 } },
  { name: 'indexRequiredSince_indexJob', key: { [fields.indexRequiredSince]: 1, [fields.indexJob]: 1 } },
  { name: 'indexRequiredSince_indexJobTimeout', key: { [fields.indexRequiredSince]: 1, [fields.indexJobTimeout]: 1 } }
];

export class MongoEntryRepository extends MongoEntityRepository<Entry> implements EntryRepository {
  constructor(collection: Collection<Entry>, logger: Logger) {
    super(collection, noopTransformer, { indexes, logger });
  }

  async initialize(): Promise<void> {
    await this.collection.createIndexes(indexes);
  }

  async upsertEntry(entry: NewEntry): Promise<void> {
    const { updateOne: { filter, update, upsert } } = toUpdateOneOperation(entry);
    await this.collection.updateOne(filter, update, { upsert });
  }

  async upsertEntries(entries: NewEntry[]): Promise<void> {
    const bulk = this.baseRepository.bulk();

    for (const entry of entries) {
      const { updateOne: { filter, update, upsert } } = toUpdateOneOperation(entry);

      bulk.update(filter, update, { upsert });
    }

    await bulk.execute(false);
  }

  async getIndexJob(count: number, timeout: number): Promise<{ jobId: string, entries: Entry[] }> {
    const timestamp = currentTimestamp();
    const indexJob = getRandomString(10, Alphabet.LowerUpperCaseNumbers);

    const filter: FilterQuery<Entry> = {
      $or: [
        { indexRequiredSince: { $ne: undefined }, indexJob: undefined },
        { indexRequiredSince: { $ne: undefined }, indexJobTimeout: { $lte: timestamp } }
      ]
    };

    const update: UpdateQuery<Entry> = {
      $set: {
        indexJob,
        indexJobTimeout: timestamp + timeout
      }
    };

    const bulk = this.baseRepository.bulk();

    for (let i = 0; i < count; i++) {
      bulk.update(filter, update);
    }

    await bulk.execute();

    const entries = await this.baseRepository.loadManyByFilter({ indexJob });

    return { jobId: indexJob, entries };
  }

  async setIndexJobFinished(jobId: string): Promise<void> {
    const filter: FilterQuery<Entry> = {
      indexJob: jobId
    };

    const update: UpdateQuery<Entry> = {
      $unset: {
        [fields.indexRequiredSince]: true,
        [fields.indexJobTimeout]: true,
        [fields.indexJob]: true
      }
    };

    await this.baseRepository.updateMany(filter, update);
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function toUpdateOneOperation(entry: NewEntry) {
  const timestamp = currentTimestamp();

  const filter: FilterQuery<Entry> = {
    source: entry.source,
    tag: entry.tag
  };

  const { lastSeen, firstSeen, ...entryWithoutFirstAndLastSeen } = entry;

  const update: UpdateQuery<Entry> = {
    $max: { lastSeen },
    $min: { firstSeen },
    $set: {
      ...entryWithoutFirstAndLastSeen,
      [fields.indexRequiredSince]: timestamp,
      [fields.indexJob]: undefined,
      [fields.indexJobTimeout]: undefined,
      updated: timestamp
    },
    $setOnInsert: {
      _id: getNewDocumentId(),
      created: timestamp,
      deleted: false
    }
  };

  const operation = {
    updateOne: {
      filter,
      update,
      upsert: true
    }
  };

  return operation;
}
