import { Serializer, SerializedElement, SerializeHandler } from '../';

type SerializedArrayData = {
  [key: string]: SerializedElement;
}

const TYPE = 'array';

export class ArraySerializeHandler implements SerializeHandler {
  canSerialize(obj: any): boolean {
    return Array.isArray(obj);
  }

  serialize(obj: any): SerializedElement {
    const array = obj as any[];

    const serializedElements: SerializedElement[] = [];

    for (let i = 0; i < array.length; i++) {
      const value = array[i];

      const serializedElement = Serializer.serialize(value, false);
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

      const value = Serializer.deserialize(serializedElement);
      resultArray[i] = value;
    }

    return resultArray;
  }
}