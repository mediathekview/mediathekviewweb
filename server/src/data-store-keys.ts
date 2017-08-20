interface IDatastoreKeys {
  ImportedFilmlistTimestamps: string;
  EntryMap: string;
  EntryIDTimestampSortedSet: string;
  LastFilmlistsCheckTimestamp: string;
  ImportIDCounter: string;
  TrackingSetsSortedSet: string;
  LastIndexedImportID: string;
  getTrackingSet(id: number): string;
}

class _DatastoreKeys {
  static EntryMap = 'entryMap';
  static EntryIDTimestampSortedSet = 'entryIDTimestamps';
  static ImportedFilmlistTimestamps = 'importedFilmlistTimestamps';
  static LastFilmlistsCheckTimestamp = 'lastFilmlistsCheckTimestamp';
  static ImportIDCounter = 'importIDCounter';
  static TrackingSetsSortedSet = 'trackingSets';
  static LastIndexedImportID = 'lastIndexedImportID';
  static getTrackingSet(id: number): string {
    return `track:${id}`;
  }
}

export const DatastoreKeys = _DatastoreKeys as IDatastoreKeys;
