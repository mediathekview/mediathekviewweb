import * as Mongo from 'mongodb';

import { AsyncEnumerable } from '../../common/enumerable';
import { Entity } from '../../common/model';
import { AnyIterable } from '../../common/utils';
import { MongoDocument, toEntity, toMongoDocumentWithPartialId } from './mongo-document';
import { MongoFilter } from './mongo-query';

const CREATED_PROPERTY = 'created';
const UPDATED_PROPERTY = 'updated';
const ITEM_PROPERTY = 'item';
const BATCH_SIZE = 100;

export class MongoBaseRepository<T extends Entity, TWithPartialId extends PartialProperty<T, 'id'> = PartialProperty<T, 'id'>> {
  private readonly collection: Mongo.Collection<MongoDocument<T>>;

  constructor(collection: Mongo.Collection<MongoDocument<T>>) {
    this.collection = collection;
  }

  save(entity: TWithPartialId): Promise<T> {
    const result = this.saveMany([entity]);
    return AsyncEnumerable.single(result);
  }

  saveMany(entities: AnyIterable<TWithPartialId>): AsyncIterable<T> {
    const result = AsyncEnumerable.from(entities)
      .batch(BATCH_SIZE)
      .map((operations) => operations.map(this.getReplaceOneOperation))
      .parallelMap(3, false, async (operations) => {
        const result = await this.collection.bulkWrite(operations);

        const saved = AsyncEnumerable.from(entities)
          .map((entity, index) => {
            let id = entity.id;

            const hasUpsertedId = (result.upsertedIds as Object).hasOwnProperty(index);

            if (hasUpsertedId) {
              id = result.upsertedIds[index]._id;
            }

            return entity as any as T;
          });

        return saved;
      })
      .mapMany((entities) => entities);

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
    const idsArray = await AsyncEnumerable.toArray(ids);

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

  private getReplaceOneOperation(entity: TWithPartialId) {
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
