import { DataType } from '../';

export type SerializeFunction<T> = (obj: T) => string;
export type DeserializeFunction<T> = (serialized: string) => T;

export function getSerializer<T>(dataType: DataType): SerializeFunction<T> {
  return (obj: any) => serialize(obj, dataType);
}

export function getDeserializer<T>(dataType: DataType): DeserializeFunction<T> {
  return (serialized: string) => deserialize(serialized, dataType);
}

export function serialize(obj: any, dataType: DataType): string {
  if (dataType == DataType.Date) {
    obj = (obj as Date).valueOf();
  }

  return JSON.stringify(obj);
}

export function deserialize(serialized: string, dataType: DataType): any {
  const deserialized = JSON.parse(serialized);

  if (dataType == DataType.Date) {
    return new Date(deserialized);
  }

  return deserialized;
}
