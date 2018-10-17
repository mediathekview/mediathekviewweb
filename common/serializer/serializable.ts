export interface Serializable {
  serialize(): any;
}

export interface SerializableStatic extends Function {
  deserialize(data: any): Serializable;
}
