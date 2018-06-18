import { Serializer, SerializedElement, SerializeHandler } from '../';

const TYPE = 'array';

export class ArraySerializeHandler implements SerializeHandler {
  private readonly serializer: Serializer;

  constructor(serializer: Serializer) {
    this.serializer = serializer;
  }

  canSerialize(obj: any): boolean {
    return Array.isArray(obj);
  }

  serialize(obj: any): SerializedElement {
    const array = obj as any[];

    const serializedElements: SerializedElement[] = [];

    for (let i = 0; i < array.length; i++) {
      const value = array[i];

      const serializedElement = this.serializer.serialize(value, false);
      serializedElements[i] = serializedElement;
    }

    return {
      type: TYPE,
      data: serializedElements
    };
  }

  canDeserialize(serialized: SerializedElement): boolean {
    return serialized.type == TYPE;
  }

  deserialize(serialized: SerializedElement): any {
    const serializedElements = serialized.data as SerializedElement[];

    const resultArray: any[] = [];

    for (let i = 0; i < serializedElements.length; i++) {
      const serializedElement = serializedElements[i];

      const value = this.serializer.deserialize(serializedElement);
      resultArray[i] = value;
    }

    return resultArray;
  }
}
