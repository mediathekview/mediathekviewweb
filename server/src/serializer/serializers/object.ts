import { SerializerStatic, SerializedElement, SerializeHandler } from '../';

const TYPE = 'object';

export class ObjectSerializeHandler implements SerializeHandler {
  private readonly serializer: SerializerStatic;

  constructor(serializer: SerializerStatic) {
    this.serializer = serializer;
  }

  canSerialize(obj: any): boolean {
    const prototype = Object.getPrototypeOf(obj);
    const result = prototype.constructor.name === 'Object';

    return result;
  }

  serialize(obj: any): SerializedElement {
    const data: StringMap<SerializedElement> = {};
    const properties = Object.getOwnPropertyNames(obj);

    for (let property of properties) {
      const value = obj[property];
      const serialized = this.serializer.serialize(value, false);

      data[property] = serialized;
    }

    return {
      type: TYPE,
      data: data
    };
  }

  canDeserialize(serialized: SerializedElement): boolean {
    return serialized.type === TYPE;
  }

  deserialize(serialized: SerializedElement): any {
    const properties = Object.getOwnPropertyNames(serialized.data);
    const result: StringMap = {};

    for (let property of properties) {
      const value = serialized.data[property];
      const deserialized = this.serializer.deserialize(value);

      result[property] = deserialized;
    }

    return result;
  }
}
