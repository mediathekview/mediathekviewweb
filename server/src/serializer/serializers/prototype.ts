import { SerializableStatic, Serializable, SerializeHandler, SerializedElement } from '../';

type SerializedInstance = {
  constructor: string;
  data: any;
}

interface PrototypeSerializerStatic {
  register(prototype: SerializableStatic): void;
  serialize(instance: Serializable): string;
  deserialize(serializedString: string): Serializable;
}

const TYPE = 'prototype';

export class PrototypeSerializeHandler implements SerializeHandler {
  private readonly registered: Map<string, SerializableStatic> = new Map();

  register(prototype: SerializableStatic) {
    this.registered.set(prototype.name, prototype);
  }

  canSerialize(obj: any): boolean {
    return typeof (obj as Serializable).serialize == 'function';
  }

  serialize(obj: any): SerializedElement {
    const instance = obj as Serializable;

    const data = instance.serialize();

    const serializedInstance: SerializedInstance = {
      constructor: instance.constructor.name,
      data: data
    };

    return {
      type: TYPE,
      data: serializedInstance
    };
  }

  canDeserialize(serialized: SerializedElement): boolean {
    return serialized.type == TYPE;
  }

  deserialize(serialized: SerializedElement): any {
    const serializedInstance = serialized.data as SerializedInstance;
    const prototype = this.registered.get(serializedInstance.constructor);

    if (prototype == undefined) {
      throw new Error(`no prototype named ${serializedInstance.constructor} registered`);
    }

    const instance = prototype.deserialize(serializedInstance.data);
    return instance;
  }
}