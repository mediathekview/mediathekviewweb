import { SerializedElement, SerializeHandler } from '../';

const TYPE = 'date';

export class DateSerializeHandler implements SerializeHandler {
  canSerialize(obj: any): boolean {
    return obj instanceof Date;
  }

  serialize(obj: any): SerializedElement {
    return {
      type: TYPE,
      data: (obj as Date).valueOf()
    };
  }

  canDeserialize(serialized: SerializedElement): boolean {
    return serialized.type == TYPE;
  }

  deserialize(serialized: SerializedElement): any {
    return new Date(serialized.data);
  }
}