import { ObjectID } from 'mongodb';

import { Entity } from '../../common/model';
import { PartialProperty } from '../../common/utils';

export type EntityWithPartialId<T extends Entity = Entity> = PartialProperty<T, 'id'>;

export function objectIdOrStringToString(id: string | ObjectID): string {
  if (typeof id == 'string') {
    return id;
  }

  return id.toHexString();
}

export function stringToObjectIdOrString(id: string): string | ObjectID {
  const valid = ObjectID.isValid(id);

  if (valid) {
    return ObjectID.createFromHexString(id);
  }

  return id;
}