import { ObjectID } from 'mongodb';

export function objectIDOrStringToString(id: string | ObjectID): string {
  if (typeof id == 'string') {
    return id;
  }

  return id.toHexString();
}

export function stringToObjectIDOrString(id: string): string | ObjectID {
  const valid = ObjectID.isValid(id);

  if (valid) {
    return ObjectID.createFromHexString(id);
  }

  return id;
}
