import { ObjectId } from 'mongodb';

import { Entity } from '../../common/model';

export type EntityWithPartialId<T extends Entity = Entity> = PartialProperty<T, 'id'>;

export type UpsertedIds = NumberMap<{ _id: ObjectId }>;

export function objectIdOrStringToString(id: string | ObjectId): string {
  if (typeof id == 'string') {
    return id;
  }

  return id.toHexString();
}

export function stringToObjectIdOrString(id: string): string | ObjectId {
  const valid = ObjectId.isValid(id);

  if (valid) {
    return ObjectId.createFromHexString(id);
  }

  return id;
}