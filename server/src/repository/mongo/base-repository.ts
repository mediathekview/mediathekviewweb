import * as Mongo from 'mongodb';

import { MongoFilter, MongoUpdate } from '../../common/mongo-query';
import { Document, Entity } from '../../common/model';
import { MongoDocument, InsertedMongoDocument } from './mongo-document';
import { map, now, AnyIterable, FeedableAsyncIterable } from '../../common/utils';
import { objectIDOrStringToString, stringToObjectIDOrString } from './utils';
import { SaveItem } from '../save-item';
import { AsyncEnumerable } from '../../common/enumerable/index';

const CREATED_PROPERTY = 'created';
const UPDATED_PROPERTY = 'updated';
const ITEM_PROPERTY = 'item';

export class MongoBaseRepository<T> {
  private readonly collection: Mongo.Collection<InsertedMongoDocument<T>>;

  constructor(collection: Mongo.Collection<InsertedMongoDocument<T>>) {
    this.collection = collection;
  }

  save(item: T): Promise<Document<T>>;
  save(item: T, id: string): Promise<Document<T>>;
  async save(item: T, id?: string): Promise<Document<T>> {
    const result = await this.saveMany([{ item: item, id: id }]);
    return result[0];
  }

  async saveMany(items: SaveItem<T>[]): Promise<Document<T>[]> {
    const mongoDocuments = items.map((item) => new MongoDocument(item.item, item.id));
    const operations = mongoDocuments.map((document) => this.getUpdateOneOperation(document));

    const result = await this.collection.bulkWrite(operations);

    const documents = mongoDocuments.map((mongoDocument, index) => {
      let id = mongoDocument._id;

      const hasUpsertedId = (result.upsertedIds as Object).hasOwnProperty(index);
      if (hasUpsertedId) {
        id = result.upsertedIds[index]._id;
      }

      return mongoDocument.toDocument(id);
    });

    return documents;
  }

  async load(id: string): Promise<Document<T> | null> {
    const filter: MongoFilter = {
      _id: id
    };

    const result = await this.collection.findOne(filter);

    if (result == null) {
      return null;
    }

    const document = MongoDocument.fromInserted(result).toDocument();
    return document;
  }

  async *loadMany(ids: AnyIterable<string>): AsyncIterable<Document<T>> {
    const idsArray = await AsyncEnumerable.toArray(ids);

    const filter: MongoFilter = {
      _id: { $in: idsArray }
    }

    const cursor = this.collection.find(filter);

    let insertedDocument: InsertedMongoDocument<T>;
    while ((insertedDocument = await cursor.next()) != null) {
      const document = MongoDocument.fromInserted(insertedDocument).toDocument();
      yield document;
    }
  }

  private getUpdateOneOperation(document: MongoDocument<T>): { updateOne: { filter: MongoFilter, update: MongoUpdate, upsert: boolean } } {
    const filter: MongoFilter = {};

    if (document._id != undefined) {
      filter['_id'] = document._id;
    }

    const update: MongoUpdate = {
      $setOnInsert: { created: document[CREATED_PROPERTY] },
      $max: { updated: document[UPDATED_PROPERTY] },
      $set: { item: document[ITEM_PROPERTY] }
    }

    const operation = {
      updateOne: {
        filter: filter,
        update: update,
        upsert: true
      }
    };

    return operation;
  }
}
