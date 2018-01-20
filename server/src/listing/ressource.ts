export enum RessourceType {
  Http,
  FileSystem
}

export type Ressource = {
  type: RessourceType,
  uri: string
}