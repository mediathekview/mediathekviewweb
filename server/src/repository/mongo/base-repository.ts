import * as Mongo from 'mongodb';

import { AsyncEnumerable } from '../../common/enumerable';
import { Entity } from '../../common/model';
import { AnyIterable } from '../../common/utils';
import { MongoDocument, toEntity, toMongoDocumentWithPartialId } from './mongo-document';
import { MongoFilter } from './mongo-query';
import { objectIdOrStringToString, UpsertedIds } from './utils';

const BATCH_SIZE = 100;

type TWithPartialId<T extends Entity> = PartialProperty<T, 'id'>;

export class MongoBaseRepository<T extends Entity> {
  private readonly collection: Mongo.Collection<MongoDocument<T>>;

  constructor(collection: Mongo.Collection<MongoDocument<T>>) {
    this.collection = collection;
  }

  save(entity: TWithPartialId<T>): Promise<T> {
    const result = this.saveMany([entity]);
    return AsyncEnumerable.from(result).single();
  }

  saveMany(entities: AnyIterable<TWithPartialId<T>>): AsyncIterable<T> {
    const result = AsyncEnumerable.from(entities)
      .batch(BATCH_SIZE)
      .map((entitiesBatch) => {
        const operations = entitiesBatch.map((entity) => this.toReplaceOneOperation(entity));
        return ({ entitiesBatch, operations });
      })
      .parallelMap(3, false, async ({ entitiesBatch, operations }) => {
        const bulkWriteResult = await this.collection.bulkWrite(operations);
        return { entitiesBatch, upsertedIds: bulkWriteResult.upsertedIds as UpsertedIds };
      })
      .mapMany(({ entitiesBatch, upsertedIds }) => entitiesBatch.map((entity) => ({ entity, upsertedIds })))
      .map(({ entity, upsertedIds }, index) => {
        const entityCopy = { ...entity };

        const hasUpsertedId = upsertedIds.hasOwnProperty(index);
        if (hasUpsertedId) {
          entityCopy.id = objectIdOrStringToString(upsertedIds[index]._id);
        }

        return entityCopy as any as T;
      });

    return result;
  }

  async load(id: string): Promise<T | null> {
    const filter = {
      _id: id
    };

    const document = await this.collection.findOne(filter);
    const entity = (document == null) ? null : toEntity(document);

    return entity;
  }

  async *loadMany(ids: AnyIterable<string>): AsyncIterable<T> {
    const idsArray = await AsyncEnumerable.from(ids).toArray();

    const filter: MongoFilter = {
      _id: { $in: idsArray }
    }

    const cursor = this.collection.find<MongoDocument<T>>(filter);

    let document: MongoDocument<T>;
    while ((document = await cursor.next()) != null) {
      const entity = toEntity(document);
      yield entity;
    }
  }

  async drop(): Promise<void> {
    await this.collection.drop();
  }

  private toReplaceOneOperation(entity: TWithPartialId<T>): Object {
    const filter: MongoFilter = {};

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
}
