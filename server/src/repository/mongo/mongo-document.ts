import { ObjectId } from 'mongodb';
import { Entity, EntityWithPartialId } from '../../common/model';
import { Omit, PartialProperty } from '../../common/types';
import { objectIdOrStringToString, stringToObjectIdOrString } from './utils';

export type MongoDocument<T extends Entity> = Omit<T, 'id'> & {
  _id: string | ObjectId;
};

export type MongoDocumentWitPartialId<T extends PartialProperty<Entity, 'id'>> = Omit<T, 'id'> & {
  _id?: string | ObjectId;
};

export function toEntity<T extends Entity>(document: MongoDocument<T>): T {
  const { _id, ...entityRest } = document;

  const entity: T = {
    id: objectIdOrStringToString(_id),
    ...entityRest
  } as any as T;

  return entity;
}

export function toMongoDocument<T extends Entity>(entity: T): MongoDocument<T> {
  const { id, ...entityRest } = entity;

  const document: MongoDocument<T> = {
    _id: stringToObjectIdOrString(entity.id),
    ...entityRest
  };

  return document;
}

export function toMongoDocumentWithPartialId<T extends EntityWithPartialId<Entity>>(entity: T): MongoDocumentWitPartialId<T> {
  const { id, ...entityRest } = entity;

  const document = {
    _id: (id != undefined) ? stringToObjectIdOrString(id) : undefined,
    ...entityRest
  };

  return document;
}
