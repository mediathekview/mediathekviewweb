import { SerializedElement } from './serialized-element';

export interface SerializeHandler {
  canSerialize(obj: any): boolean;
  serialize(obj: any): SerializedElement;

  canDeserialize(serialized: SerializedElement): boolean;
  deserialize(serialized: SerializedElement): any;
}
