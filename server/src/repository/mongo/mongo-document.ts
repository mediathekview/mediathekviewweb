import { ObjectId } from 'mongodb';

import { Entity } from '../../common/model';
import { Omit, PartialProperty } from '../../common/utils';
import { objectIdOrStringToString, stringToObjectIdOrString, EntityWithPartialId } from './utils';

export type MongoDocument<T extends Entity> = Omit<T, 'id'> & {
  _id: string | ObjectId;
}

export type MongoDocumentWitPartialId<T extends PartialProperty<Entity, 'id'>> = Omit<T, 'id'> & {
  _id?: string | ObjectId;
}

export function toEntity<T extends Entity>(document: MongoDocument<T>): T {
  const entity: T = {
    id: objectIdOrStringToString(document._id),
    ...(document as ObjectMap)
  } as T;

  delete (entity as any as MongoDocument<T>)._id;

  return entity;
}

export function toMongoDocument<T extends Entity>(entity: T): MongoDocument<T> {
  const document: MongoDocument<T> = {
    _id: stringToObjectIdOrString(entity.id),
    ...(entity as ObjectMap)
  } as MongoDocument<T>;

  delete (document as any as T).id;

  return document;
}

export function toMongoDocumentWithPartialId<T extends EntityWithPartialId>(entity: T): MongoDocumentWitPartialId<T> {
  const document: MongoDocumentWitPartialId<T> = {
    ...(entity as ObjectMap)
  } as MongoDocumentWitPartialId<T>;

  if (entity.id != undefined) {
    document._id = entity.id;
  }

  delete (document as any as T).id;

  return document;
}