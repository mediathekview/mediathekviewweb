import type { EntryRepository } from '$repositories/entry.repository';
import type { Entry } from '$shared/models/core';
import { fields } from '$shared/models/core';
import type { Logger } from '@tstdl/base/logger';
import { Alphabet, createArray, currentTimestamp, getRandomString } from '@tstdl/base/utils';
import type { Collection, FilterQuery, TypedIndexSpecification, UpdateQuery } from '@tstdl/mongo';
import { MongoEntityRepository, noopTransformer, toMongoDocument } from '@tstdl/mongo';

const indexes: TypedIndexSpecification<Entry>[] = [
  { key: { [fields.tag]: 1 }, unique: true },
  { key: { [fields.firstSeen]: 1 } },
  { key: { [fields.lastSeen]: 1 } },
  { key: { [fields.indexRequiredSince]: 1 } },
  { key: { [fields.indexJobTimeout]: 1 } },
  { key: { [fields.indexJob]: 1 } },
  { key: { [fields.indexRequiredSince]: 1, [fields.indexJob]: 1 } },
  { key: { [fields.indexRequiredSince]: 1, [fields.indexJobTimeout]: 1 } }
];

export class MongoEntryRepository extends MongoEntityRepository<Entry> implements EntryRepository {
  constructor(collection: Collection<Entry>, logger: Logger) {
    super(collection, noopTransformer, { indexes, logger });
  }

  async initialize(): Promise<void> {
    await this.collection.createIndexes(indexes);
  }

  async save(entry: Entry): Promise<void> {
    const { updateOne: { filter, update, upsert } } = toUpdateOneOperation(entry);
    await this.collection.updateOne(filter, update, { upsert });
  }

  async saveMany(entries: Entry[]): Promise<void> {
    const operations = entries.map(toUpdateOneOperation);
    await this.collection.bulkWrite(operations, { ordered: false });
  }

  async getIndexJob(count: number, timeout: number): Promise<{ jobId: string, entries: Entry[] }> {
    const indexJob = getRandomString(10, Alphabet.LowerUpperCaseNumbers);
    const timestamp = currentTimestamp();

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

    const operations = createArray(count, () => ({ updateOne: { filter, update } }));
    await this.baseRepository.collection.bulkWrite(operations);
    const entries = await this.baseRepository.loadManyByFilter({ indexJob });

    return { jobId: indexJob, entries };
  }

  async setIndexJobFinished(jobId: string): Promise<void> {
    const filter: FilterQuery<Entry> = {
      indexJob: jobId
    };

    const update: UpdateQuery<Entry> = {
      $set: {
        [fields.indexRequiredSince]: undefined,
        [fields.indexJobTimeout]: undefined,
        [fields.indexJob]: undefined
      }
    };

    await this.baseRepository.updateMany(filter, update);
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function toUpdateOneOperation(entry: Entry) {
  const filter: FilterQuery<Entry> = {
    _id: entry.id
  };

  const { lastSeen, firstSeen, ...documentWithoutFirstAndLastSeen } = toMongoDocument(entry);

  const update: UpdateQuery<Entry> = {
    $max: { lastSeen },
    $min: { firstSeen },
    $set: {
      ...documentWithoutFirstAndLastSeen,
      [fields.indexRequiredSince]: currentTimestamp(),
      [fields.indexJob]: undefined,
      [fields.indexJobTimeout]: undefined
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
