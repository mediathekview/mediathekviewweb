import { SerializeHandler } from '../serialize-handler';
import { SerializedElement } from '../serialized-element';
import { Serializer } from '../serializer';

const TYPE = 'array';

type SerializedArray = SerializedElement<SerializedElement[]>;

export class ArraySerializeHandler implements SerializeHandler {
  canSerialize(obj: any): boolean {
    return Array.isArray(obj);
  }

  serialize(array: any[]): SerializedArray {
    const serializedElements = array.map((item) => Serializer.rawSerialize(item));

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
    const deserializedElements = serializedElements.map((element) => Serializer.deserialize(element));

    return deserializedElements;
  }
}
