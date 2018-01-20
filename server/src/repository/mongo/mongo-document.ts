import { ObjectID } from 'mongodb';
import { Document } from '../../common/model';
import { now } from '../../common/utils';
import { objectIDOrStringToString, stringToObjectIDOrString } from './utils';

export type InsertedMongoDocument<T> = {
  _id: string | ObjectID;
  created: Date;
  updated: Date;
  item: T;
}

export class MongoDocument<T> {
  _id?: string | ObjectID;
  created: Date;
  updated: Date;
  item: T;

  constructor(item: T);
  constructor(item: T, id?: string | ObjectID);
  constructor(item: T, id?: string | ObjectID, created?: Date);
  constructor(item: T, id?: string | ObjectID, created?: Date, updated?: Date);
  constructor(item: T, id?: string | ObjectID, created?: Date, updated?: Date) {
    if (id != undefined) {
      if (typeof id == 'string') {
        this._id = stringToObjectIDOrString(id);
      } else {
        this._id == id;
      }
    }

    this.item = item;

    const date = now();
    this.created = (created != undefined) ? created : date;
    this.updated = (updated != undefined) ? updated : date;
  }

  toDocument(id?: string | ObjectID): Document<T> {
    if (id == undefined) {
      if (this._id == undefined) {
        throw new Error('id of document not yet set');
      }

      id = this._id;
    }

    id = objectIDOrStringToString(id);

    if ((this._id != null) && (this._id != id)) {
      throw new Error('paramter id differs from documents id');
    }

    const document = {
      id: id,
      created: this.created,
      updated: this.updated,
      item: this.item
    };

    return document;
  }

  toInserted(id?: string | ObjectID): InsertedMongoDocument<T> {
    if (id == undefined) {
      if (this._id == undefined) {
        throw new Error('id of document not yet set');
      }

      id = this._id;
    }

    if ((this._id != null) && (this._id != id)) {
      throw new Error('paramter id differs from documents id');
    }

    return {
      _id: id,
      created: this.created,
      updated: this.updated,
      item: this.item
    }
  }

  static fromInserted<T>(mongoDocument: InsertedMongoDocument<T>): MongoDocument<T> {
    return new MongoDocument<T>(mongoDocument.item, mongoDocument._id, mongoDocument.created, mongoDocument.updated);
  }

  static fromDocument<T>(document: Document<T>): MongoDocument<T> {
    return new MongoDocument<T>(document.item, document.id, document.created, document.updated);
  }
}
