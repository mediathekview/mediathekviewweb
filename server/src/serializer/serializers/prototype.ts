import { SerializableStatic, Serializable, SerializeHandler, SerializedElement } from '../';
import { Serializer } from '../serializer';

type SerializedInstanceData = {
  prototype: string;
  data: any;
}

type SerializedInstance = SerializedElement<SerializedInstanceData>;

const TYPE = 'prototype';

export class PrototypeSerializeHandler implements SerializeHandler {
  private readonly serializer: Serializer;
  private readonly prototypes: Map<string, SerializableStatic>;

  constructor(serializer: Serializer) {
    this.serializer = serializer;
    this.prototypes = new Map();
  }

  register(prototype: SerializableStatic) {
    this.prototypes.set(prototype.name, prototype);
  }

  canSerialize(obj: any): boolean {
    return typeof (obj as Serializable).serialize == 'function';
  }

  serialize(obj: any): SerializedInstance {
    const instance = obj as Serializable;

    const data = instance.serialize();
    const serializedData = this.serializer.serialize(data, false);

    const serializedInstanceData: SerializedInstanceData = {
      prototype: instance.constructor.name,
      data: serializedData
    };

    return {
      type: TYPE,
      data: serializedInstanceData
    };
  }

  canDeserialize(serialized: SerializedElement): boolean {
    return serialized.type == TYPE;
  }

  deserialize(serializedInstance: SerializedInstance): any {
    const serializedInstanceData = serializedInstance.data;
    const prototype = this.prototypes.get(serializedInstanceData.prototype);

    if (prototype == undefined) {
      throw new Error(`no prototype named ${serializedInstanceData.prototype} registered`);
    }

    const deserializedData = this.serializer.deserialize(serializedInstanceData.data);
    const instance = prototype.deserialize(deserializedData);

    return instance;
  }
}
