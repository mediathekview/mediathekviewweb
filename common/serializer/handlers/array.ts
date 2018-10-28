import { SerializedElement, SerializeHandler, Serializer } from '../';

const TYPE = 'array';

type SerializedArray = SerializedElement<SerializedElement[]>;

export class ArraySerializeHandler implements SerializeHandler {
  private readonly serializer: Serializer;

  constructor(serializer: Serializer) {
    this.serializer = serializer;
  }

  canSerialize(obj: any): boolean {
    return Array.isArray(obj);
  }

  serialize(array: any[]): SerializedArray {
    const serializedElements = array.map((item) => this.serializer.rawSerialize(item));

    return {
      type: TYPE,
      data: serializedElements
    };
  }

  canDeserialize(serialized: SerializedElement): boolean {
    return serialized.type == TYPE;
  }

  deserialize(serialized: SerializedArray): any {
    const serializedElements = serialized.data;
    const deserializedElements = serializedElements.map((element) => this.serializer.deserialize(element));

    return deserializedElements;
  }
}
