import * as Mongo from 'mongodb';
import { SyncEnumerable } from '../../common/enumerable';
import { Entity, EntityWithPartialId } from '../../common/model';
import { MongoDocument, toEntity, toMongoDocumentWithPartialId } from './mongo-document';
import { MongoFilter, TypedMongoFilter } from './mongo-query';
import { IdsMap, objectIdOrStringToString } from './utils';

export class MongoBaseRepository<T extends Entity> {
  private readonly collection: Mongo.Collection<MongoDocument<T>>;

  constructor(collection: Mongo.Collection<MongoDocument<T>>) {
    this.collection = collection;
  }

  async insert(entity: EntityWithPartialId<T>): Promise<T> {
    const savedEntities = await this.insertMany([entity]);
    return SyncEnumerable.from(savedEntities).single();
  }

  async replace(entity: EntityWithPartialId<T>, upsert: boolean): Promise<T> {
    const savedEntities = await this.replaceMany([entity], upsert);
    return SyncEnumerable.from(savedEntities).single();
  }

  async insertMany(entities: EntityWithPartialId<T>[]): Promise<T[]> {
    const operations = entities.map(toInsertOneOperation);
    const bulkWriteResult = await this.collection.bulkWrite(operations);
    const insertedIds = bulkWriteResult.insertedIds as IdsMap;
    const savedEntities = entities.map((entity, index) => {
      const entityCopy = { ...entity };

      const hasInsertedId = insertedIds.hasOwnProperty(index);
      if (hasInsertedId) {
        entityCopy.id = objectIdOrStringToString(insertedIds[index]._id);
      }

      return entityCopy as T;
    });

    return savedEntities;
  }

  async replaceMany(entities: EntityWithPartialId<T>[], upsert: boolean): Promise<T[]> {
    const operations = entities.map((entity) => toReplaceOneOperation(entity, upsert));
    const bulkWriteResult = await this.collection.bulkWrite(operations);
    const upsertedIds = bulkWriteResult.upsertedIds as IdsMap;
    const savedEntities = entities.map((entity, index) => {
      const entityCopy = { ...entity };

      const hasUpsertedId = upsertedIds.hasOwnProperty(index);
      if (hasUpsertedId) {
        entityCopy.id = objectIdOrStringToString(upsertedIds[index]._id);
      }

      return entityCopy as T;
    });

    return savedEntities;
  }

  async load(id: string): Promise<T | undefined> {
    const filter = {
      _id: id
    };

    const document = await this.collection.findOne(filter);
    const entity = (document == undefined) ? undefined : toEntity(document);

    return entity;
  }

  async *loadManyById(ids: string[]): AsyncIterableIterator<T> {
    const filter: MongoFilter = {
      _id: { $in: ids }
    };

    yield* this.loadManyByFilter(filter);
  }

  async *loadManyByFilter(filter: MongoFilter): AsyncIterableIterator<T> {
    const cursor = this.collection.find<MongoDocument<T>>(filter);

    while (true) {
      const document = await cursor.next();

      if (document == undefined) {
        break;
      }

      const entity = toEntity(document);
      yield entity;
    }
  }

  async countByFilter(filter: Mongo.FilterQuery<MongoDocument<T>>): Promise<number> {
    return this.collection.countDocuments(filter);
  }

  async hasByFilter(filter: Mongo.FilterQuery<MongoDocument<T>>): Promise<boolean> {
    const count = await this.countByFilter(filter);
    return count > 0;
  }

  async has(id: string): Promise<boolean> {
    const filter = { _id: id };
    return this.hasByFilter(filter);
  }

  async hasMany(ids: string[]): Promise<string[]> {
    const filter: MongoFilter = {
      _id: { $in: ids }
    };

    const result = await this.collection.distinct('_id', filter) as string[];
    return result;
  }

  async drop(): Promise<void> {
    await this.collection.drop();
  }
}

function toInsertOneOperation<T extends Entity>(entity: EntityWithPartialId<T>): object {
  const document = toMongoDocumentWithPartialId(entity);

  const operation = {
    insertOne: {
      document
    }
  };

  return operation;
}

function toReplaceOneOperation<T extends Entity>(entity: EntityWithPartialId<T>, upsert: boolean): object {
  const filter: TypedMongoFilter<T> = {};

  if (entity.id != undefined) {
    filter._id = entity.id;
  }

  const replacement = toMongoDocumentWithPartialId(entity);

  const operation = {
    replaceOne: {
      filter,
      replacement,
      upsert
    }
  };

  return operation;
}
