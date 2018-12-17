import { Serializer } from '../../common/serializer';
import { DataType } from '../data-type';

export type SerializeFunction<T> = (obj: T) => string;
export type DeserializeFunction<T> = (serialized: string) => T;

export function getSerializer<T>(dataType: DataType): SerializeFunction<T> {
  return (obj: any) => serialize(obj, dataType);
}

export function getDeserializer<T>(dataType: DataType): DeserializeFunction<T> {
  return (serialized: string) => deserialize(serialized, dataType);
}

export function serialize(obj: any, dataType: DataType): string {
  switch (dataType) {
    case DataType.Date:
      obj = (obj as Date).valueOf();
      break;

    case DataType.Object:
      obj = Serializer.rawSerialize(obj);
      break;
  }

  return JSON.stringify(obj);
}

export function deserialize(serialized: string, dataType: DataType): any {
  let deserialized = JSON.parse(serialized);

  switch (dataType) {
    case DataType.Date:
      deserialized = new Date(deserialized);
      break;

    case DataType.Object:
      deserialized = Serializer.deserialize(deserialized);
      break;
  }

  return deserialized;
}
