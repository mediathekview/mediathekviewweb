export interface IHTTPListing {
  getAllFiles(url: string, recursive: boolean): Promise<Listing[]>;
  getAllFolders(url: string, recursive: boolean): Promise<Listing[]>;
  getAllListings(url: string, recursive: boolean): Promise<Listing[]>;
}

export enum ListingType {
  File,
  Folder
}

export interface Listing {
  name: string;
  url: string;
  type: ListingType;
}
