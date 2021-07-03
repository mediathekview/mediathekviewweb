import type { EntryRepository } from '$repositories/entry.repository';
import type { Entry, NewEntry } from '$shared/models/core';
import type { Logger } from '@tstdl/base/logger';
import { Alphabet, currentTimestamp, getRandomString } from '@tstdl/base/utils';
import { getNewId } from '@tstdl/database';
import type { Collection, FilterQuery, TypedIndexSpecification, UpdateQuery } from '@tstdl/mongo';
import { MongoEntityRepository, noopTransformer } from '@tstdl/mongo';

const indexes: TypedIndexSpecification<Entry>[] = [
  { name: 'source_tag', key: { source: 1, tag: 1 }, unique: true },
  { name: 'firstSeen', key: { firstSeen: 1 } },
  { name: 'lastSeen', key: { lastSeen: 1 } },
  { name: 'indexRequiredSince', key: { indexRequiredSince: 1 } },
  { name: 'indexJobTimeout', key: { indexJobTimeout: 1 } },
  { name: 'indexJob', key: { indexJob: 1 } },
  { name: 'indexRequiredSince_indexJob', key: { indexRequiredSince: 1, indexJob: 1 } },
  { name: 'indexRequiredSince_indexJobTimeout', key: { indexRequiredSince: 1, indexJobTimeout: 1 } }
];

export class MongoEntryRepository extends MongoEntityRepository<Entry> implements EntryRepository {
  constructor(collection: Collection<Entry>, logger: Logger) {
    super(collection, noopTransformer, { indexes, logger });
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

  async hasPendingJob(): Promise<boolean> {
    const filter = getIndexJobFilter();
    return this.baseRepository.hasByFilter(filter);
  }

  async getIndexJob(count: number, timeout: number): Promise<{ jobId: string, entries: Entry[] }> {
    const timestamp = currentTimestamp();
    const indexJob = getRandomString(15, Alphabet.LowerUpperCaseNumbers);

    const filter = getIndexJobFilter();

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
      $set: {
        indexRequiredSince: null,
        indexJobTimeout: null,
        indexJob: null
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
      indexRequiredSince: timestamp,
      indexJob: undefined,
      indexJobTimeout: undefined
    },
    $setOnInsert: {
      _id: getNewId()
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

function getIndexJobFilter(): FilterQuery<Entry> {
  const filter: FilterQuery<Entry> = {
    indexRequiredSince: { $gte: 0 },
    $or: [
      { indexJob: undefined },
      { indexJobTimeout: { $lte: currentTimestamp() } }
    ]
  };

  return filter;
}
