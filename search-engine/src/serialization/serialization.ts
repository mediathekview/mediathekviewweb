export interface ISerializer<T, T2> {
  serialize(value: T): T2;
  deserialize(value: T2): T;
}
