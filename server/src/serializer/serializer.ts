import { SerializableStatic } from './serializable';
import { SerializeHandler } from './serialize-handler';
import { SerializedElement } from './serialized-element';
import {
  ArraySerializeHandler,
  DateSerializeHandler,
  ObjectSerializeHandler,
  PrimitivesSerializeHandler,
  PrototypeSerializeHandler,
  RegexSerializeHandler
} from './serializers';

export class Serializer {
  private readonly prototypeSerializeHandler: PrototypeSerializeHandler;
  private readonly handlers: SerializeHandler[] = [];

  constructor() {
    this.prototypeSerializeHandler = new PrototypeSerializeHandler();

    const handlers: SerializeHandler[] = [
      new PrimitivesSerializeHandler(),
      new ObjectSerializeHandler(this),
      new ArraySerializeHandler(this),
      new DateSerializeHandler(),
      new RegexSerializeHandler(),
      this.prototypeSerializeHandler
    ];

    this.registerHandler(...handlers);
  }

  registerHandler(...handlers: SerializeHandler[]) {
    this.handlers.push(...handlers);
  }

  registerPrototype(prototype: SerializableStatic) {
    this.prototypeSerializeHandler.register(prototype);
  }

  serialize(obj: any): string;
  serialize(obj: any, stringify: false): SerializedElement;
  serialize(obj: any, stringify: boolean = true): string | SerializedElement {
    const handler = this.getSerializationHandler(obj);
    let result: string | SerializedElement = handler.serialize(obj);

    if (stringify) {
      result = JSON.stringify(result);
    }

    return result;
  }

  deserialize(serializedString: string): any;
  deserialize(serializedElement: SerializedElement): any;
  deserialize(serializedStringOrElement: string | SerializedElement): any {
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

  private getSerializationHandler(obj: any): SerializeHandler {
    const handler = this.handlers.find((handler) => handler.canSerialize(obj));

    if (handler == undefined) {
      const constructorName = Object.getPrototypeOf(obj).constructor.name;
      throw new Error(`no suitable handler available for prototype ${constructorName}`);
    }

    return handler;
  }

  private getDeserializationHandler(serializedElement: SerializedElement): SerializeHandler {
    const handler = this.handlers.find((handler) => handler.canDeserialize(serializedElement));

    if (handler == undefined) {
      throw new Error('no suitable handler available');
    }

    return handler;
  }
}
