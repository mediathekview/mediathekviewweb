import { StringMap } from '../../types';
import { SerializeHandler } from '../serialize-handler';
import { SerializedElement } from '../serialized-element';
import { Serializer } from '../serializer';

type SerializedObject = SerializedElement<StringMap<SerializedElement>>;

const type = 'object';

export class ObjectSerializeHandler implements SerializeHandler {
  canSerialize(obj: any): boolean {
    const prototype = Object.getPrototypeOf(obj);
    const result = prototype.constructor.name == 'Object'; // tslint:disable-line: no-unsafe-any

    return result;
  }

  serialize(obj: any): SerializedObject {
    const data: StringMap<SerializedElement> = {};
    const properties = Object.getOwnPropertyNames(obj);

    for (const property of properties) {
      const value = obj[property];
      const serialized = Serializer.rawSerialize(value);

      data[property] = serialized;
    }

    return { type, data };
  }

  canDeserialize(serialized: SerializedObject): boolean {
    return serialized.type == type;
  }

  deserialize(serialized: SerializedObject): any {
    const properties = Object.getOwnPropertyNames(serialized.data);
    const result: StringMap = {};

    for (const property of properties) {
      const value = serialized.data[property];
      const deserialized = Serializer.deserialize(value);

      result[property] = deserialized;
    }

    return result;
  }
}
