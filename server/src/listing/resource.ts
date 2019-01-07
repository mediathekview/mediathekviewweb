export enum ResourceType {
  Http,
  FileSystem
}

export type Resource = {
  type: ResourceType,
  uri: string
};
