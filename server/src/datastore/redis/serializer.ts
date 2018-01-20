import { DataType } from '../';

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