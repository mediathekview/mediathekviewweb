import * as Mongo from 'mongodb';
import { AsyncEnumerable, SyncEnumerable } from '../../common/enumerable';
import { Entity } from '../../common/model';
import { AnyIterable } from '../../common/utils';
import { MongoDocument, toEntity, toMongoDocumentWithPartialId } from './mongo-document';
import { MongoFilter, TypedMongoFilter } from './mongo-query';
import { objectIdOrStringToString, UpsertedIds } from './utils';

type TWithPartialId<T extends Entity> = PartialProperty<T, 'id'>;

export class MongoBaseRepository<T extends Entity> {
  private readonly collection: Mongo.Collection<MongoDocument<T>>;

  constructor(collection: Mongo.Collection<MongoDocument<T>>) {
    this.collection = collection;
  }

  async save(entity: TWithPartialId<T>): Promise<T> {
    const savedEntities = await this.saveMany([entity]);
    return await SyncEnumerable.from(savedEntities).single();
  }

  async saveMany(entities: TWithPartialId<T>[]): Promise<T[]> {
    const operations = entities.map((entity) => toReplaceOneOperation(entity));
    const bulkWriteResult = await this.collection.bulkWrite(operations);
    const upsertedIds = bulkWriteResult.upsertedIds as UpsertedIds;
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

  async load(id: string): Promise<T | null> {
    const filter = {
      _id: id
    };

    const document = await this.collection.findOne(filter);
    const entity = (document == null) ? null : toEntity(document);

    return entity;
  }

  loadManyById(ids: string[]): AsyncIterable<T> {
    const filter: MongoFilter = {
      _id: { $in: ids }
    };

    return this.loadManyByFilter(filter);
  }

  async *loadManyByFilter(filter: MongoFilter) {
    const cursor = this.collection.find<MongoDocument<T>>(filter);

    let document: MongoDocument<T> | null;
    while ((document = await cursor.next()) != null) {
      const entity = toEntity(document);
      yield entity;
    }
  }

  async has(id: string) {
    const cursor = this.collection.find({ _id: id });
    const count = await cursor.count();

    return count > 0;
  }

  async hasMany(ids: AnyIterable<string>) {
    const array = await AsyncEnumerable.from(ids).toArray();

    const filter: MongoFilter = {
      _id: { $in: array }
    };

    const result = await this.collection.distinct('_id', filter) as string[];
    return result;
  }

  async drop(): Promise<void> {
    await this.collection.drop();
  }
}

function toReplaceOneOperation<T extends Entity>(entity: TWithPartialId<T>) {
  const filter: TypedMongoFilter<T> = {};

  if (entity.id != undefined) {
    filter['_id'] = entity.id;
  }

  const replacement = toMongoDocumentWithPartialId(entity);

  const operation = {
    replaceOne: {
      filter,
      replacement,
      upsert: true
    }
  };

  return operation;
}
