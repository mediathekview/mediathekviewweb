import { ObjectId } from 'mongodb';

import { Entity, EntityWithPartialId } from '../../common/model';
import { objectIdOrStringToString, stringToObjectIdOrString } from './utils';

export type MongoDocument<T extends Entity> = Omit<T, 'id'> & {
  _id: string | ObjectId;
}

export type MongoDocumentWitPartialId<T extends PartialProperty<Entity, 'id'>> = Omit<T, 'id'> & {
  _id?: string | ObjectId;
}

export function toEntity<T extends Entity>(document: MongoDocument<T>): T {
  const { _id, ...entity } = document as StringMap;
  (entity as T).id = objectIdOrStringToString(_id);

  return entity as T;
}

export function toMongoDocument<T extends Entity>(entity: T): MongoDocument<T> {
  const { id, ...document } = entity as StringMap;
  (document as MongoDocument<T>)._id = stringToObjectIdOrString(entity.id);

  return document as MongoDocument<T>;
}

export function toMongoDocumentWithPartialId<T extends EntityWithPartialId>(entity: T): MongoDocumentWitPartialId<T> {
  const { id, ...document } = entity as StringMap;

  if (id != undefined) {
    (document as MongoDocumentWitPartialId<T>)._id = stringToObjectIdOrString(id);
  }

  return document as MongoDocumentWitPartialId<T>;
}
