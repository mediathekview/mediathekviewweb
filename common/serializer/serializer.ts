import { ArraySerializeHandler, DateSerializeHandler, ObjectSerializeHandler, PrimitivesSerializeHandler, PrototypeSerializeHandler, RegexSerializeHandler } from './handlers';
import { SerializableStatic } from './serializable';
import { SerializeHandler } from './serialize-handler';
import { SerializedElement } from './serialized-element';

interface SerializerStatic {
  registerHandler(...handlers: SerializeHandler[]): void;
  registerPrototype(prototype: SerializableStatic): void;

  serialize(obj: any): string;
  rawSerialize(obj: any): SerializedElement;

  deserialize(serializedString: string): any;
  deserialize(serializedElement: SerializedElement): any;
  deserialize(serializedStringOrElement: string | SerializedElement): any
}

class _Serializer {
  private static readonly handlers: SerializeHandler[] = [];

  private static prototypeSerializeHandler: PrototypeSerializeHandler;

  static setPrototypeSerializerHandler(prototypeSerializeHandler: PrototypeSerializeHandler) {
    this.prototypeSerializeHandler = prototypeSerializeHandler;
  }

  static registerHandler(...handlers: SerializeHandler[]) {
    this.handlers.push(...handlers);
  }

  static registerPrototype(prototype: SerializableStatic) {
    this.prototypeSerializeHandler.register(prototype);
  }

  static serialize(obj: any): string {
    const serializedElement = this.rawSerialize(obj);
    const serializedString = JSON.stringify(serializedElement);

    return serializedString;
  }

  static rawSerialize(obj: any): SerializedElement {
    const handler = this.getSerializationHandler(obj);
    const serializedElement = handler.serialize(obj);

    return serializedElement;
  }

  static deserialize(serializedString: string): any;
  static deserialize(serializedElement: SerializedElement): any;
  static deserialize(serializedStringOrElement: string | SerializedElement): any {
    let serializedElement: SerializedElement;

    if (typeof serializedStringOrElement == 'string') {
      serializedElement = JSON.parse(serializedStringOrElement);
    } else {
      serializedElement = serializedStringOrElement;
    }

    const handler = this.getDeserializationHandler(serializedElement);
    const result = handler.deserialize(serializedElement);

    return result;
  }

  private static getSerializationHandler(obj: any): SerializeHandler {
    const handler = this.handlers.find((handler) => handler.canSerialize(obj));

    if (handler == undefined) {
      const constructorName = Object.getPrototypeOf(obj).constructor.name;
      throw new Error(`no suitable handler available for prototype ${constructorName}`);
    }

    return handler;
  }

  private static getDeserializationHandler(serializedElement: SerializedElement): SerializeHandler {
    const handler = this.handlers.find((handler) => handler.canDeserialize(serializedElement));

    if (handler == undefined) {
      throw new Error(`no suitable handler available for ${serializedElement.type}`);
    }

    return handler;
  }
}

const prototypeSerializeHandler = new PrototypeSerializeHandler()

const handlers: SerializeHandler[] = [
  new PrimitivesSerializeHandler(),
  new ObjectSerializeHandler(),
  new ArraySerializeHandler(),
  new DateSerializeHandler(),
  new RegexSerializeHandler(),
  prototypeSerializeHandler
];

_Serializer.setPrototypeSerializerHandler(prototypeSerializeHandler);
_Serializer.registerHandler(...handlers);

export const Serializer = _Serializer as SerializerStatic;
