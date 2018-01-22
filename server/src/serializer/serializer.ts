import { SerializedElement } from './serialized-element';
import { SerializeHandler } from './serialize-handler';
import { RegexSerializeHandler, DateSerializeHandler, ObjectSerializeHandler, PrimitivesSerializeHandler, ArraySerializeHandler, PrototypeSerializeHandler } from './serializers';
import { SerializableStatic } from './serializable';

export interface SerializerStatic {
  registerHandler(handler: SerializeHandler): void;
  registerPrototype(prototype: SerializableStatic): void;

  serialize(obj: any): string;
  serialize(obj: any, stringify: false): SerializedElement;

  deserialize(serializedString: string): any;
  deserialize(serializedElement: SerializedElement): any;
}

class _Serializer {
  private static readonly handlers: SerializeHandler[] = [];

  static registerHandler(...handlers: SerializeHandler[]) {
    this.handlers.push(...handlers);
  }

  static registerPrototype(prototype: SerializableStatic) {
    prototypeSerializeHandler.register(prototype);
  }

  static serialize(obj: any): string;
  static serialize(obj: any, stringify: false): SerializedElement;
  static serialize(obj: any, stringify: boolean = true): string | SerializedElement {
    const handler = this.getSerializationHandler(obj);
    let result: string | SerializedElement = handler.serialize(obj);

    if (stringify) {
      result = JSON.stringify(result);
    }

    return result;
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
      throw new Error('no suitable handler available');
    }

    return handler;
  }
}

const prototypeSerializeHandler = new PrototypeSerializeHandler();

const handlers: SerializeHandler[] = [
  new PrimitivesSerializeHandler(),
  new ObjectSerializeHandler(_Serializer),
  new ArraySerializeHandler(),
  new DateSerializeHandler(),
  new RegexSerializeHandler(),
  prototypeSerializeHandler
];

_Serializer.registerHandler(...handlers);

export const Serializer = _Serializer as SerializerStatic;
