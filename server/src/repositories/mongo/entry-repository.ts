import { createArray, currentTimestamp, getRandomString } from '@tstdl/base/utils';
import { Collection, FilterQuery, MongoBaseRepository, MongoDocument, toMongoDocument, TypedIndexSpecification, UpdateQuery } from '@tstdl/mongo';
import * as Mongo from 'mongodb';
import { Entry, Field } from '../../common/models';
import { EntryRepository } from '../entry-repository';

const indexes: TypedIndexSpecification<Entry>[] = [
  { key: { [Field.FirstSeen]: 1 } },
  { key: { [Field.LastSeen]: 1 } },
  { key: { [Field.IndexRequiredSince]: 1 } },
  { key: { [Field.IndexJobTimeout]: 1 } },
  { key: { [Field.IndexJob]: 1 } },
  { key: { indexRequiredSince: 1, indexJob: 1 } },
  { key: { indexRequiredSince: 1, indexJobTimeout: 1 } }
];

export class MongoEntryRepository implements EntryRepository {
  private readonly collection: Collection<Entry>;
  private readonly baseRepository: MongoBaseRepository<Entry>;

  constructor(collection: Collection<Entry>) {
    this.collection = collection;
    this.baseRepository = new MongoBaseRepository(collection);
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

  async load(id: string): Promise<Entry> {
    return this.baseRepository.load(id);
  }

  async loadMany(ids: string[]): Promise<Entry[]> {
    return this.baseRepository.loadManyById(ids);
  }

  async getIndexJob(count: number, timeout: number): Promise<{ jobId: string, entries: Entry[] }> {
    const indexJob = getRandomString(10);
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
        [Field.IndexRequiredSince]: undefined,
        [Field.IndexJobTimeout]: undefined,
        [Field.IndexJob]: undefined
      }
    };

    await this.baseRepository.updateMany(filter, update);
  }
}

// tslint:disable-next-line: typedef
function toUpdateOneOperation(entry: Entry) {
  const filter: Mongo.FilterQuery<MongoDocument<Entry>> = {
    _id: entry.id
  };

  const { lastSeen, firstSeen, ...documentWithoutFirstAndLastSeen } = toMongoDocument(entry);

  const update: Mongo.UpdateQuery<MongoDocument<Entry>> = {
    $max: { lastSeen },
    $min: { firstSeen },
    $set: {
      ...documentWithoutFirstAndLastSeen,
      [Field.IndexRequiredSince]: currentTimestamp(),
      [Field.IndexJob]: undefined,
      [Field.IndexJobTimeout]: undefined
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
