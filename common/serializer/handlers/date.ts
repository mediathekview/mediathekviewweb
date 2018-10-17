import { SerializedElement, SerializeHandler } from '../';

type SerializedDate = SerializedElement<number>;

const TYPE = 'date';

export class DateSerializeHandler implements SerializeHandler {
  canSerialize(obj: any): boolean {
    return obj instanceof Date;
  }

  serialize(obj: any): SerializedDate {
    return {
      type: TYPE,
      data: (obj as Date).valueOf()
    };
  }

  canDeserialize(serialized: SerializedElement): boolean {
    return serialized.type == TYPE;
  }

  deserialize(serialized: SerializedDate): any {
    return new Date(serialized.data);
  }
}
