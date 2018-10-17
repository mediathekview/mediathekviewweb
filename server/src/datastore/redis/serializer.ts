import { DataType } from '../';
import { Serializer } from '../../common/serializer';

export type SerializeFunction<T> = (obj: T) => string;
export type DeserializeFunction<T> = (serialized: string) => T;

export function getSerializer<T>(dataType: DataType, serializer: Serializer): SerializeFunction<T> {
  return (obj: any) => serialize(obj, dataType, serializer);
}

export function getDeserializer<T>(dataType: DataType, serializer: Serializer): DeserializeFunction<T> {
  return (serialized: string) => deserialize(serialized, dataType, serializer);
}

export function serialize(obj: any, dataType: DataType, serializer: Serializer): string {
  switch (dataType) {
    case DataType.Date:
      obj = (obj as Date).valueOf();
      break;

    case DataType.Object:
      obj = serializer.rawSerialize(obj);
      break;
  }

  return JSON.stringify(obj);
}

export function deserialize(serialized: string, dataType: DataType, serializer: Serializer): any {
  let deserialized = JSON.parse(serialized);

  switch (dataType) {
    case DataType.Date:
      deserialized = new Date(deserialized);
      break;

    case DataType.Object:
      deserialized = serializer.deserialize(deserialized);
      break;
  }

  return deserialized;
}
